// Example usage
import {
  createEntityRoute,
  generateEntityRouter,
} from "@/createEntityRouter.tsx";
import { RootRoute } from "@tanstack/react-router";
import {
  insertInvoiceSchema,
  selectInvoiceSchema,
} from "backend/src/db/invoices.ts";
import {
  insertPaymentSchema,
  selectPaymentSchema,
} from "backend/src/db/payments.ts";
import {
  insertAcceptedTokenSchema,
  selectAcceptedTokenSchema,
} from "backend/src/db/schema.ts";
import { PlaneIcon, UserIcon } from "lucide-react";

export const generateAppConfig = (props: { rootRoute: RootRoute }) => {
  const invoiceRoute = createEntityRoute({
    id: "invoices",
    selectSchema: selectInvoiceSchema.omit({
      wallet: true,
      description: true,
      updatedAt: true,
    }),
    insertSchema: insertInvoiceSchema.omit({
      updatedAt: true,
      createdAt: true,
    }),
    icon: UserIcon,
    tableConfig: {
      id: {
        enableSorting: true,
      },
      createdAt: {
        enableSorting: true,
      },
      wallet: {
        enableSorting: true,
      },
    },
  });

  const paymentsRoute = createEntityRoute({
    id: "payments",
    selectSchema: selectPaymentSchema,
    insertSchema: insertPaymentSchema,
    icon: PlaneIcon,
    tableConfig: {},
  });

  const acceptedTokensRoute = createEntityRoute({
    id: "accepted_tokens",
    selectSchema: selectAcceptedTokenSchema,
    insertSchema: insertAcceptedTokenSchema,
    icon: PlaneIcon,
    tableConfig: {},
  });

  return [
    generateEntityRouter(props.rootRoute, invoiceRoute),
    generateEntityRouter(props.rootRoute, paymentsRoute),
    generateEntityRouter(props.rootRoute, acceptedTokensRoute),
  ];
};
