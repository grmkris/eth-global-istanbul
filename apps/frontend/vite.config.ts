import path from "path";
import react from "@vitejs/plugin-react";
import { searchForWorkspaceRoot, defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import viteTsConfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [
        react(),
        nodePolyfills(),
        // viteTsConfigPaths({
        //     root: '../../'
        // })
    ],
    // base: "./",
    resolve: {
        alias: {
        "@": path.resolve(__dirname, "./src"),
        // "@cowprotocol/app-data": path.resolve(__dirname, "../../node_modules/@cowprotocol/app-data"),
        },
    },
    // server: {
    //     port: 3000,
    //     host: 'localhost',
    //     fs: {
    //         allow: [
    //             // search up for workspace root
    //             searchForWorkspaceRoot(process.cwd()),
    //             './node_modules'
    //         ],
    //     },
    // },
});
