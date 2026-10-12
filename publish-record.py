"""Expand the reviewed, checksum-pinned public TRUEQ record. No chain calls."""
import hashlib, json, os, pathlib, subprocess, zipfile

root = pathlib.Path.cwd().resolve()
bundle = root / 'trueq-public-record.zip'
if hashlib.sha256(bundle.read_bytes()).hexdigest() != os.environ['RECORD_SHA256']:
    raise SystemExit('Public bundle checksum mismatch')
allowed_dirs = {'console', 'metadata', 'verify', 'evidence'}
allowed_files = {'README.md', 'README.es.md', '.gitignore', 'FILE-SHA256.json'}
with zipfile.ZipFile(bundle) as z:
    entries = [i for i in z.infolist() if not i.is_dir()]
    names = []
    for info in entries:
        name = info.filename
        p = pathlib.PurePosixPath(name)
        if '\\' in name or p.is_absolute() or '..' in p.parts or not p.parts or (p.parts[0] not in allowed_dirs and name not in allowed_files):
            raise SystemExit('Unexpected archive path')
        if any(part in {'.git', '.github', 'node_modules', '.env', 'keystore'} for part in p.parts):
            raise SystemExit('Forbidden archive path')
        if name in names or info.file_size > 2000000 or ((info.external_attr >> 16) & 0o170000) == 0o120000:
            raise SystemExit('Invalid archive entry')
        target = root.joinpath(*p.parts).resolve()
        if not target.is_relative_to(root):
            raise SystemExit('Unsafe archive path')
        names.append(name)
    for info, name in zip(entries, names):
        target = root.joinpath(*pathlib.PurePosixPath(name).parts)
        target.parent.mkdir(parents=True, exist_ok=True)
        target.write_bytes(z.read(info))

manifest = json.loads((root / 'FILE-SHA256.json').read_text())
if sorted(x['path'] for x in manifest['files']) != sorted(n for n in names if n != 'FILE-SHA256.json'):
    raise SystemExit('Manifest file set mismatch')
for item in manifest['files']:
    content = root.joinpath(*pathlib.PurePosixPath(item['path']).parts).read_bytes()
    if len(content) != item['bytes'] or hashlib.sha256(content).hexdigest() != item['sha256']:
        raise SystemExit('Published file checksum mismatch')
subprocess.run(['node', '--test'], check=True)
def git(*args):
    return subprocess.check_output(['git', *args])
git('config', 'user.name', 'github-actions[bot]')
git('config', 'user.email', '41898282+github-actions[bot]@users.noreply.github.com')
git('add', '--', *names)
if git('diff', '--cached', '--name-only').strip():
    git('commit', '-m', 'Publish TRUEQ Solana launch record, original console and read-only verifier')
    git('push', 'origin', 'HEAD:main')
print('Published commit:', git('rev-parse', 'HEAD').decode().strip())
