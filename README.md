[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/7Ga9TYp-)
# BuildNow Buyer App

## Deploy

https://proyecto-b-buyer-buildnow.vercel.app

## Usuarios de prueba

### Comprador

| Usuario | Password |
| --- | --- |
| `buyer+clerktest@iaw.com`| `iawuser#` |
| `buyer_1@gmail.com` | `comprador_1` |
| `buyer_2@gmail.com` | `comprador_2` |
| `buyer_3@gmail.com` | `comprador_3` |
| `buyer_4@gmail.com` | `comprador_4` |
| `buyer_5@gmail.com` | `comprador_5` |
| `buyer_6@gmail.com` | `comprador_6` |

### Administrador

- Usuario: `admin+clerktest@iaw.com`
- Password: `iawuser#`

## Instrucciones de uso

- Ingresar al deploy y autenticarse con alguno de los usuarios de prueba.
- También se puede registrar un nuevo comprador desde `/register`; al completar el perfil se asigna automáticamente el rol `buyer`.
- Como comprador, se pueden buscar productos por tienda, categoría o nombre, gestionar el carrito, editar perfil y direcciones, consultar pedidos y usar el asistente de materiales con IA.
- Como administrador, se puede acceder al panel admin simple para revisar información de compradores, direcciones y carritos.

## Descripción del proyecto

Aplicación **Buyer** del [Proyecto IAW 2026](https://iaw-2026.github.io/proyecto/) — comisión *BuildNow*. Esta app corresponde al rol del comprador en los proyectos de tipo **B (Delivery)**.

BuildNow Buyer App es una plataforma de delivery de materiales de construcción. Permite a compradores explorar tiendas y productos, armar un carrito, gestionar sus datos personales y direcciones, y hacer seguimiento de pedidos.

La aplicación integra la API externa GEOREF para autocompletar ciudades argentinas en direcciones. Además, cuenta con un asistente de materiales con IA que recomienda productos disponibles en una tienda según la necesidad indicada por el usuario.

## Notas para la corrección

- Enunciado completo: <https://iaw-2026.github.io/proyecto/>
- Documentación ampliada: [Estructura del proyecto](buyer-app/docs/estructura-proyecto.html)
- La documentación HTML se puede ver como código desde GitHub; para verla renderizada, abrirla localmente en el navegador o usar una vista previa HTML.
- El catálogo y algunos flujos contemplan mocks locales cuando no hay URL de servicio externo configurada.
