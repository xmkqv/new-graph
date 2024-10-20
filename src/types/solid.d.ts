/* eslint-disable-next-line unused-imports/no-unused-imports */
import * as Solid from "solid-js";

// declare module "solid-js" {
//     namespace JSX {
//         interface Directives {
//             sendMemo: (e: Event) => void;
//         }
//     }
// }

declare module "solid-js" {
    namespace JSX {
        interface DirectiveFunctions {
            sendMemo: (element: HTMLElement, memo: any) => void;
        }
    }
}
