/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />
declare module 'html2pdf.js' { const html2pdf: () => { set: (options: object) => { from: (element: HTMLElement) => { save: () => Promise<void> } } }; export default html2pdf }
