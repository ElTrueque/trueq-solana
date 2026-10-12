# TRUEQ en Solana

[English](README.md)

Ficha pública del lanzamiento de **el-trueque.com (TRUEQ)** en Solana mainnet. Incluye la consola original, el JSON exacto de metadatos, los recibos y un verificador de solo lectura.

**TRUEQ no tiene un contrato de token propio que verificar.** Su mint pertenece al programa oficial SPL Token, `TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA`. La consola llamó a ese programa y a Metaplex Token Metadata; el vesting utiliza Jupiter Lock. Este repositorio no despliega ningún programa nuevo.

## Registro del lanzamiento

Se acuñaron **1.000.000 TRUEQ**, con **6 decimales**. Después se quemaron **40.000 TRUEQ** mediante `BurnChecked`, dejando **960.000 TRUEQ** en la comprobación registrada. No hay autoridad de acuñación ni de congelamiento. Los metadatos de Metaplex son inmutables.

| Asignación | Porcentaje del suministro inicial | Estado |
| --- | ---: | --- |
| Vesting | 80% / objetivo de 800.000 TRUEQ | **799.999,9993 TRUEQ** depositados en Jupiter Lock; **0,0007 TRUEQ** de redondeo quedaron en la wallet creadora |
| Pool Meteora | 15% / 150.000 TRUEQ | **Pendiente**: dirección y recibo se añadirán tras ejecutarla |
| Quema | 4% / 40.000 TRUEQ | **Ejecutada**, recibo independiente enlazado abajo |
| Airdrop a holders de NFT | 1% / 10.000 TRUEQ | **Pendiente**: recibos de distribución y bloqueo se añadirán después |

Los porcentajes se calculan sobre el **millón original**, no sobre los 960.000 posteriores a la quema. Justo después del vesting, la wallet creadora conservaba **160.000,0007 TRUEQ**: pool y airdrop previstos, más el redondeo. Es un saldo histórico; no se promete que siga siendo el saldo actual.

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

Pruebas locales positivas y negativas: `node --test`. Para actualizar la evidencia fechada: `node verify/verify.mjs --write-evidence`. No necesita instalar dependencias. La revisión previa a publicar del **12/10/2026** pasó **53 comprobaciones** y las **19 pruebas locales**.

Cada comprobación imprime `OK` o `FALLA`; un fallo devuelve código de salida distinto de cero. Solo utiliza métodos públicos de consulta RPC y solicitudes públicas a IPFS. No carga claves, conecta wallets, firma ni envía transacciones. Un error del nodo o del gateway no equivale a una comprobación correcta.

El código y las referencias fijadas de Jupiter están en [`verify/`](verify/); la evidencia pública, en [`evidence/`](evidence/). Es una captura fechada de respuestas RPC, no una auditoría independiente de SPL Token, Metaplex o Jupiter Lock. Otras quemas o retiros pueden cambiar suministro y saldos: deben informarse las diferencias actuales sin reescribir los recibos originales.

## Pasos pendientes

Estos son **planes, no operaciones completadas certificadas por este commit**:

1. Meteora DAMM v2: 150.000 TRUEQ de un solo lado contra SOL, precio inicial previsto de 0,02 USD por TRUEQ, apertura **12/10/2026 15:00 UTC**, comisión de 50% a 1% en la primera hora, cobro solo en SOL y liquidez bloqueada para siempre. Dirección, parámetros exactos y recibos del bloqueo se añadirán en otro commit.
2. Airdrop: 10.000 TRUEQ a 11 wallets de holders de NFT después de la apertura, con bloqueo. No se publican todavía las direcciones destinatarias ni se afirma que se ejecutó.

La descripción original e inmutable de los metadatos menciona asignaciones y políticas; ese texto no sustituye los recibos pendientes. Las operaciones futuras se documentarán por separado. Esta ficha no modifica la web, los bots, Fast Launch ni otros contratos.
