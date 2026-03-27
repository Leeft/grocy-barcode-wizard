import Barcode from "@/app/lib/barcode";

interface IdleState {
  type: "idle";
  barcode?: Barcode;
  editing: boolean;
}

interface ParsedState {
  type: "parsed";
  barcode: Barcode;
  editing: boolean;
}

interface UserIsEditingState {
  type: "editing";
  barcode: Barcode;
  editing: boolean;
}

interface UserIsSavingState {
  type: "saving";
  barcode: Barcode;
}

interface UserHasSavedState {
  type: "saved";
  saved: boolean;
  barcode: Barcode;
}

interface ProductPurchaseState {
  type: "product-purchase";
  barcode: Barcode;
}

interface ProductConsumeState {
  type: "product-consume";
  barcode: Barcode;
}

interface ProductConsumeAllState {
  type: "product-consume-all";
  barcode: Barcode;
}

interface ProductSpoiledState {
  type: "product-consume-spoiled";
  barcode: Barcode;
}

interface ProductOpenState {
  type: "product-open";
  barcode: Barcode;
}

interface ProductInventoryState {
  type: "product-inventory";
  barcode: Barcode;
}

interface ProductAddShoppinglistState {
  type: "product-add-shopping-list";
  barcode: Barcode;
}

type BarcodeState =
  | IdleState
  | ParsedState
  | UserIsEditingState
  | UserIsSavingState
  | UserHasSavedState
  | ProductPurchaseState
  | ProductConsumeState
  | ProductConsumeAllState
  | ProductSpoiledState
  | ProductOpenState
  | ProductInventoryState
  | ProductAddShoppinglistState;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
type BarcodeEvent =
  | { type: "BARCODE_IDLE"; barcode: Barcode }
  | { type: "BARCODE_SCANNED"; barcode: Barcode; editing: boolean }
  | { type: "USER_EDITING"; barcode: Barcode; editing: boolean }
  | { type: "USER_CANCELLED_EDITING"; barcode: Barcode }
  | { type: "USER_SAVING"; barcode: Barcode }
  | { type: "USER_SAVE_FAILED"; barcode: Barcode }
  | { type: "USER_SAVE_SUCCESS"; barcode: Barcode }
  | { type: "PRODUCT_PURCHASE"; barcode: Barcode }
  | { type: "PRODUCT_CONSUME"; barcode: Barcode }
  | { type: "PRODUCT_CONSUME_ALL"; barcode: Barcode }
  | { type: "PRODUCT_SPOILED"; barcode: Barcode }
  | { type: "PRODUCT_OPEN"; barcode: Barcode }
  | { type: "PRODUCT_INVENTORY"; barcode: Barcode }
  | { type: "PRODUCT_SHOPPING_LIST"; barcode: Barcode };

// This function should never be called - it's just for type checking
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${JSON.stringify(value)}`);
}

// const SPECIAL_PREFIX: string = "^(SHO|BBUDDY)$";
//
// function barcodeTransition(state: BarcodeState, event: BarcodeEvent): BarcodeState {
//   switch (state.type) {
//     case "idle": {
//       if (event.type === "BARCODE_SCANNED") {
//         return {
//           type: "parsed",
//           barcode: event.barcode,
//           editing: event.editing,
//         };
//       } else if (event.type === "USER_EDITING") {
//         return {
//           type: "editing",
//           barcode: event.barcode,
//           editing: true,
//         };
//       }
//       return state;
//     }

//     case "parsed": {
//       if (event.type === "USER_EDITING") {
//         console.log("entering edit state; barcodes should now be scrutinised");
//         return {
//           type: "editing",
//           barcode: event.barcode,
//           editing: true,
//         };
//       }

//       if (event.type === "BARCODE_SCANNED") {
//         // Guard: if a barcode comes in which isn't special while the
//         //        user is editing, ignore it.
//         if (event.editing && !/^${SPECIAL_PREFIX}[-]/.test(event.barcode.barcode)) {
//           return state;
//         }

//         const matches = event.barcode.barcode.match(/^${SPECIAL_PREFIX}[-:]([a-z]+)([0-9]+)?/i);

//         if (matches !== undefined && matches !== null) {
//           if (event.editing) {
//             // TODO: quantities might be allowed, need to figure this out still
//             console.error("ignored barcode", event.barcode, "due to editing state");
//           } else {
//             if (matches[1] !== undefined) {
//               switch (matches[1].toUpperCase()) {
//                 case "C":
//                   return {
//                     type: "product-consume",
//                     barcode: event.barcode,
//                   };
//                 case "CA":
//                   return {
//                     type: "product-consume-all",
//                     barcode: event.barcode,
//                   };
//                 case "CS":
//                   return {
//                     type: "product-consume-spoiled",
//                     barcode: event.barcode,
//                   };
//                 case "P":
//                   return {
//                     type: "product-consume",
//                     barcode: event.barcode,
//                   };
//                 case "O":
//                   return {
//                     type: "product-open",
//                     barcode: event.barcode,
//                   };
//                 case "I":
//                   return {
//                     type: "product-inventory",
//                     barcode: event.barcode,
//                   };
//                 case "AS":
//                   return {
//                     type: "product-add-shopping-list",
//                     barcode: event.barcode,
//                   };
//                 default:
//                   console.error(
//                     "Special barcode",
//                     event.barcode,
//                     "parsed to",
//                     matches[1],
//                     "which is not recognised as a valid state handler",
//                   );
//                   return state;
//               }
//             }
//           }
//         }

//         return {
//           type: "idle",
//           barcode: event.barcode,
//           editing: event.editing,
//         };
//         //
//       }

//       return state;
//     }

//     case "editing": {
//       switch (event.type) {
//         case "USER_SAVING": {
//           return {
//             type: "saving",
//             barcode: event.barcode,
//           };
//         }

//         case "USER_CANCELLED_EDITING": {
//           return {
//             type: "idle",
//             barcode: event.barcode,
//             editing: false,
//           };
//         }

//         default:
//           return state;
//       }
//     }

//     case "saving": {
//       switch (event.type) {
//         case "USER_SAVE_FAILED": {
//           return {
//             type: "editing",
//             barcode: event.barcode,
//             editing: true,
//           };
//         }

//         case "USER_SAVE_SUCCESS": {
//           return {
//             type: "idle",
//             barcode: event.barcode,
//             editing: false,
//           };
//         }

//         default:
//           return state;
//       }
//     }

//     case "saved": {
//       switch (event.type) {
//         case "BARCODE_IDLE": {
//           return {
//             type: "idle",
//             barcode: event.barcode,
//             editing: false,
//           };
//         }

//         default:
//           return state;
//       }
//     }

//     case "product-purchase":
//     case "product-consume":
//     case "product-consume-all":
//     case "product-consume-spoiled":
//     case "product-open":
//     case "product-inventory":
//     case "product-add-shopping-list": {
//       switch (event.type) {
//         case "BARCODE_IDLE": {
//           return {
//             type: "idle",
//             barcode: event.barcode,
//             editing: false,
//           };
//         }

//         default:
//           return state;
//       }
//     }

//     default:
//       return assertNever(state);
//   }
// }

type Listener<St> = (state: St) => void;

export default class BarcodeStateMachine<State, Event> {
  private state: State;
  private listeners: Set<Listener<State>> = new Set();

  constructor(
    initialState: State,
    private transitionFn: (state: State, event: Event) => State,
  ) {
    this.state = initialState;
  }

  getState(): State {
    return this.state;
  }

  send(event: Event): void {
    const previousState = this.state;
    this.state = this.transitionFn(this.state, event);

    // Only notify if state actually changed
    if (this.state !== previousState) {
      this.listeners.forEach((listener) => listener(this.state));
    }
  }

  subscribe(listener: Listener<State>): () => void {
    this.listeners.add(listener);
    // Return unsubscribe function
    return () => this.listeners.delete(listener);
  }

  // Type-safe state matching
  matches<T extends BarcodeState["type"]>(
    type: T,
  ): this is BarcodeStateMachine<Extract<State, { type: T }>, Event> {
    return (this.state as { type: string }).type === type;
  }
}

// // Usage example
// const authMachine = new StateMachine<BarcodeState, BarcodeEvent>({ type: "unauthenticated" }, authTransition);

// // Subscribe to state changes
// const unsubscribe = authMachine.subscribe((state) => {
//   console.log("Auth state changed:", state.type);
// });

// // Send events
// authMachine.send({ type: "LOGIN_START", method: "password" });
// authMachine.send({
//   type: "LOGIN_SUCCESS",
//   user: { id: "1", email: "user@example.com", name: "John", roles: ["user"] },
//   accessToken: "abc123",
//   refreshToken: "xyz789",
//   expiresAt: new Date(Date.now() + 3600000),
// });

// // Clean up
// unsubscribe();
