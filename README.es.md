# TRUEQ en Solana

[English](README.md)

Ficha pública del lanzamiento de **el-trueque.com (TRUEQ)** en Solana mainnet. Incluye la consola original, el JSON exacto de metadatos, los recibos y un verificador de solo lectura.

**TRUEQ no tiene un contrato de token propio que verificar.** Su mint pertenece al programa oficial SPL Token, `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`. La consola llamó a ese programa y a Metaplex Token Metadata; el vesting utiliza Jupiter Lock. Este repositorio no despliega ningún programa nuevo.

## Registro del lanzamiento

Se acuñaron **1.000.000 TRUEQ**, con **6 decimales**. Después se quemaron **40.000 TRUEQ** mediante `BurnChecked`, dejando **960.000 TRUEQ** en la comprobación registrada. No hay autoridad de acuñación ni de congelamiento. Los metadatos de Metaplex son inmutables.

| Asignación | Porcentaje del suministro inicial | Estado |
| --- | ---: | --- |
| Vesting | 80% / objetivo de 800.000 TRUEQ | **799.999,9993 TRUEQ** depositados en Jupiter Lock; **0,0007 TRUEQ** de redondeo quedaron en la wallet creadora |
| Pool Meteora | 15% / 150.000 TRUEQ | **Creada**, con toda la liquidez original bloqueada para siempre; apertura programada **12/10/2026 15:00 UTC** |
| Quema | 4% / 40.000 TRUEQ | **Ejecutada**, recibo independiente enlazado abajo |
| Airdrop a holders de NFT | 1% / objetivo de 10.000 TRUEQ | **9.999,999995 TRUEQ enviados directamente a 11 wallets antes de la apertura, sin bloqueo**; dos recibos abajo |

Los porcentajes se calculan sobre el **millón original**, no sobre los 960.000 posteriores a la quema. Justo después del vesting, la wallet creadora conservaba **160.000,0007 TRUEQ**: pool y airdrop previstos, más el redondeo. Es un saldo histórico; no se promete que siga siendo el saldo actual.

Después del airdrop directo y la creación de la pool, el saldo registrado del creador era **0,000705 TRUEQ**: 0,0007 del redondeo del vesting y 0,000005 del airdrop. Esta actualización sustituye los planes anteriores: la comisión real baja del **10% al 1% en cinco minutos** y el airdrop se envió **antes de la apertura, sin bloqueo**.

## Direcciones y recibos

| Dato | Dirección / transacción |
| --- | --- |
| Mint TRUEQ | [`3m4etpgjNhFduBznEtQo56u5rKpXEgcYbZzV7ijdiq8W`](https://solscan.io/token/3m4etpgjNhFduBznEtQo56u5rKpXEgcYbZzV7ijdiq8W) |
| Creador / destinatario del vesting | [`EBTS1qQjvfbxCXXcYAXbjVGjEYyGotUpuV98eTtBgtej`](https://solscan.io/account/EBTS1qQjvfbxCXXcYAXbjVGjEYyGotUpuV98eTtBgtej) |
| Programa SPL Token | [`TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`](https://solscan.io/account/TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA) |
| Creación | [`23xF9g…JzdHBr`](https://solscan.io/tx/23xF9gJfbjjUDvVnspKLbHxGsZzZWPzQyBuSyVqaTRDE3XmQL8hYDxADPZaub7iPG2Lvw4mTup6Q5gNjJ9JzdHBr) |
| Quema | [`4xMth4…N8PU`](https://solscan.io/tx/4xMth4F4kb1DzmgTLDFobpUFUzEzeFhnDE71TnrcazpwURDJAaoEaGNnr5R4aazYfYAknW8EGptCtbPsdn7kN8PU) |
| Programa Jupiter Lock | [`LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn`](https://solscan.io/account/LocpQgucEQHbqNABEYvBvwoxCPsSbG91A1QaQhQQqjn) |
| Escrow de vesting | [`4gKfvsvnjQoheN3wRAWcqUQderhfBajgcu7hh41Ho5vp`](https://solscan.io/account/4gKfvsvnjQoheN3wRAWcqUQderhfBajgcu7hh41Ho5vp) · [Jupiter Lock](https://lock.jup.ag/escrow/4gKfvsvnjQoheN3wRAWcqUQderhfBajgcu7hh41Ho5vp) |
| Cuenta de tokens del escrow | [`DTLeW1SJMChaJNxQ2R44coYriXG87mvsSfRJDXPfoHBL`](https://solscan.io/account/DTLeW1SJMChaJNxQ2R44coYriXG87mvsSfRJDXPfoHBL) |
| Depósito de vesting | [`SSLdZ5…kpfsS`](https://solscan.io/tx/SSLdZ5HAhqpUvzmJKZCfbWYTWTu69iS169ExcDARqPAwyg38yAZqpP3mXbUL3wTtjrfV5ApFQF95k6LotukpfsS) |
| Programa DAMM v2 | [`cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG`](https://solscan.io/account/cpamdpZCGKUy5JxQXB4dcpGPiikHawvSWAd6mEn1sGG) |
| Pool TRUEQ / SOL | [`7wtmy7VHBzU6pmG3K8EB25mrsyTYEBfGRBgefBAEXakt`](https://solscan.io/account/7wtmy7VHBzU6pmG3K8EB25mrsyTYEBfGRBgefBAEXakt) · [Meteora](https://www.meteora.ag/dammv2/7wtmy7VHBzU6pmG3K8EB25mrsyTYEBfGRBgefBAEXakt) |
| Creación de la pool y bloqueo permanente | [`V1W9Sz…upu1ig`](https://solscan.io/tx/V1W9SzR9vLUXepxGtJYzqSi1VPpKQVs3Uj1jrXZMcZLKrkV5vNHUA3874Mni38Me2XA3pVcKFsm1Lxupbupu1ig) |
| Posición bloqueada permanentemente | [`A7yHQXA9bu6tKxM259rVX4cYiqF5M7qGtPrY2Lzg9FpQ`](https://solscan.io/account/A7yHQXA9bu6tKxM259rVX4cYiqF5M7qGtPrY2Lzg9FpQ) |
| Mint del NFT de posición | [`HEQATttj2drSJs1L7jYdA6X8jFh57opNrGqpX6eKkZ9w`](https://solscan.io/token/HEQATttj2drSJs1L7jYdA6X8jFh57opNrGqpX6eKkZ9w) |
| Cuenta del NFT de posición | [`6a1GMa4nNjJiScrUNRQ5XRqGrVHh3sSgWcZsuX7HcrRw`](https://solscan.io/account/6a1GMa4nNjJiScrUNRQ5XRqGrVHh3sSgWcZsuX7HcrRw) |
| Bóveda TRUEQ | [`3WjecsMXPyANLppM3QiseYTxayGB9RJke9a8KMZsgpA7`](https://solscan.io/account/3WjecsMXPyANLppM3QiseYTxayGB9RJke9a8KMZsgpA7) |
| Bóveda wSOL | [`3CZZdGeYzwtR2NHzK4R8mTfGuFQegY3XT3RsJEWYS5xn`](https://solscan.io/account/3CZZdGeYzwtR2NHzK4R8mTfGuFQegY3XT3RsJEWYS5xn) |
| Airdrop lote 1 | [`2ooXve…KTYnucS`](https://solscan.io/tx/2ooXvethi7mvkG3EaTqPL84wZHi92e5BsVnhg7qdxd9fetuFZaU5pFNmQWSrUDntyYpkr6KoHfPkaKdb3KTYnucS) |
| Airdrop lote 2 | [`359QkV…fgds1zs`](https://solscan.io/tx/359QkVsJvdHtr4nmbgpBSFyae8zWgZMRxAY2UEJbpwSQBw3iicrVhtfqcr7UibeSBrqTEJL4w8wqK4ZAHfgds1zs) |

## Pool Meteora: configuración ejecutada

La pool se creó antes de abrir el trading. La activación es el timestamp **1791817200**, equivalente al **12/10/2026 a las 15:00:00 UTC**. La captura de verificación se tomó antes de esa hora: demuestra la apertura configurada, no que ya existieran operaciones.

- Token A: TRUEQ, 6 decimales. Token B: SOL envuelto (`So11111111111111111111111111111111111111112`), 9 decimales.
- Depósito inicial: **150.000 TRUEQ**, más **0,000000001 SOL** (un lamport de redondeo). Es una posición de un solo lado en términos económicos; el recibo no contiene un depósito SOL exactamente cero.
- Precio inicial: **0,000179 SOL por TRUEQ**. El rango comienza ahí y llega al máximo del protocolo. Su equivalente en dólares varía con SOL/USD; no es un precio USD fijo en cadena.
- Comisión lineal: **10% al abrir, menos 0,03 puntos porcentuales por segundo durante 300 segundos, hasta 1%**. Comisión dinámica desactivada. Numerador inicial 100.000.000, reducción 300.000 por segundo y denominador 1.000.000.000.
- Cobro de comisiones **solo en token B (wSOL)**, `collect_fee_mode = 1`. **Meteora recibe el 20% de la comisión de trading**.
- Posición: `unlocked_liquidity = 0`, `vested_liquidity = 0`; `permanent_locked_liquidity = 1170678108210830785790960230130`, igual a toda la liquidez de la pool y a su contador de bloqueo permanente. La transacción de creación contiene la instrucción de bloqueo completo.

El mint del NFT y la cuenta que contiene el NFT son direcciones distintas; se identifican por separado arriba. El verificador comprueba el IDL oficial fijado de Meteora, los formatos exactos de cuenta, las comisiones, apertura, depósito original y bloqueo permanente.

## Airdrop: transferencias directas ejecutadas

Dos transacciones correctas enviaron **9.999,999995 TRUEQ** a las cuentas de tokens asociadas de **11 wallets distintas**, antes de abrir el trading y **sin instrucción de vesting ni escrow**. El lote 1 contiene seis transferencias por 4.883,720928 TRUEQ; el lote 2, cinco por 5.116,279067 TRUEQ. Los aumentos de saldo y el débito del creador coinciden.

Solo se publican los dos recibos y los totales agregados. El verificador lee los recibos públicos en memoria, pero no imprime ni guarda la lista de destinatarios ni los recibos completos del airdrop. Esto comprueba transferencias: la elegibilidad NFT y la base de 43 NFT indicada por el dueño no se deducen de esos recibos SPL Token por sí solos.

## Calendario de vesting

- Cliff el **12/01/2027 a las 15:00 UTC**, sin liberación en ese instante.
- **1.095,89041 TRUEQ diarios**, durante 730 períodos; primera cuota el **13/01/2027 a las 15:00 UTC**, última liberación prevista el **11/01/2029 a las 15:00 UTC**.
- Total programado: **799.999,9993 TRUEQ** (`799999999300` unidades mínimas).
- Destinatario: la wallet creadora indicada arriba.
- Cancelación y cambio de destinatario deshabilitados, según los modos de la cuenta y el IDL/código público de Jupiter Lock incluidos con el verificador.

El verificador comprueba datos de cuenta y recibo, no toma esta descripción ni la interfaz de Jupiter como prueba. Los retiros futuros pueden modificar el saldo: la asignación depositada y el calendario son hechos históricos separados.

## Metadatos y consola exactos

- Nombre: `el-trueque.com`; símbolo: `TRUEQ`.
- URI: [`https://ipfs.io/ipfs/bafkreieli2cx46ryv6evklow6ks2fwr6vig47qlm5mbzm7fnwc2gl5ndbq`](https://ipfs.io/ipfs/bafkreieli2cx46ryv6evklow6ks2fwr6vig47qlm5mbzm7fnwc2gl5ndbq).
- CID de imagen: [`bafybeihbhqcpnlgrkrtoir5xepsokhqbuuafina7fwx5isttoj7yth5cha`](https://ipfs.io/ipfs/bafybeihbhqcpnlgrkrtoir5xepsokhqbuuafina7fwx5isttoj7yth5cha).
- [`metadata/trueq-solana-metadata.json`](metadata/trueq-solana-metadata.json) conserva sus **815 bytes**, espacios y descripción original. SHA-256: `8b46857e7a38af89552dd6f2a5a2da3eaa0dcfc16ceb03967cadb0b465f5a30c`. El script comprueba que corresponde al CID raw SHA-256.
- [`console/`](console/) conserva los cuatro archivos originales byte por byte, sus hashes y la explicación de las instrucciones. SHA-256 del ZIP original aportado por el dueño: `16e1cfa6c30ce2003c33b24f06b20949a5a5418acec1c32428adb3cba8f2d4a0`.

La consola archivada construía transacciones para firmar con Phantom. **No es el verificador de solo lectura.** El comando siguiente no requiere wallet. Los recibos demuestran qué se ejecutó en cadena, pero no prueban por sí solos qué aplicación de navegador utilizó el firmante. La procedencia de la consola es el archivo aportado por el dueño, conservado con sus hashes.

## Verificación independiente

Con Node.js 22 o superior, desde la raíz del repositorio:

```sh
node verify/verify.mjs
```

Pruebas locales positivas y negativas: `node --test`. Para actualizar la evidencia fechada: `node verify/verify.mjs --write-evidence`. No necesita instalar dependencias. La comprobación actualizada del **12/10/2026** pasó **95 comprobaciones** y las **28 pruebas locales**.

Cada comprobación imprime `OK` o `FALLA`; un fallo devuelve código de salida distinto de cero. Solo utiliza métodos públicos de consulta RPC y solicitudes públicas a IPFS. No carga claves, conecta wallets, firma ni envía transacciones. Un error del nodo o del gateway no equivale a una comprobación correcta.

El código y las referencias fijadas de Jupiter y Meteora están en [`verify/`](verify/); la evidencia pública, en [`evidence/`](evidence/). Es una captura fechada de respuestas RPC, no una auditoría independiente de SPL Token, Metaplex, Jupiter Lock o Meteora. Otras quemas o retiros pueden cambiar suministro y saldos: deben informarse las diferencias actuales sin reescribir los recibos originales.

Los metadatos originales e inmutables se conservan byte por byte, aunque describan planes anteriores. Para la comisión inicial y el momento/bloqueo del airdrop prevalecen los hechos ejecutados documentados arriba. Las futuras recompras y quemas necesitan sus propios recibos: este commit no afirma que hayan ocurrido. Esta ficha no modifica la web, los bots, Fast Launch ni otros contratos.
