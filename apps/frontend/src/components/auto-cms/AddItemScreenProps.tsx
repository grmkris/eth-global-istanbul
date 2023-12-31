import AutoForm, { AutoFormSubmit } from "@/components/auto-form";
import { trpcClient } from "@/features/trpc-client.ts";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";
import {useAccountAbstraction} from "@/features/aa/accountAbstractionContext.tsx";
import {toast} from "react-toastify";

export const AddItemScreen = (props: {
  entityName: "invoices" | "payments" | "accepted_tokens";
  onAdd?: () => void;
  itemSchema: z.ZodObject<any, any>;
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const addItem = trpcClient[props.entityName].create.useMutation({
    onSuccess: async () => {
      queryClient.invalidateQueries();
      toast.success("Invoice has been added!")
      await navigate({ to: "/" + props.entityName });
      props.onAdd?.();
    },
  });
  const {safeSelected} = useAccountAbstraction()

  if (props.entityName === 'invoices') {
    return (
        <div className="w-full max-w-2xl rounded-lg bg-primary-900 shadow-lg">
          <AutoForm
              className="text-success-400"
              formSchema={props.itemSchema} onSubmit={addItem.mutate}
              values={{wallet: safeSelected, status: 'pending'}}>
            <AutoFormSubmit>Add {props.entityName}</AutoFormSubmit>
          </AutoForm>
        </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-lg bg-primary-900 shadow-lg">
      <AutoForm
          className="text-success-400"
          formSchema={props.itemSchema} onSubmit={addItem.mutate}
          values={{status: 'pending'}}
      >
        <AutoFormSubmit>Add {props.entityName}</AutoFormSubmit>
      </AutoForm>
    </div>
  );
};

export const EditItemScreen = (props: {
  entityId: number;
  entityName: "invoices" | "payments" | "accepted_tokens";
  itemSchema: z.ZodObject<any, any>;
  entityData: any;
}) => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const updateEntity = trpcClient[props.entityName].update.useMutation({
    onSuccess: async () => {
      queryClient.invalidateQueries();
      // go to entity root route
      await navigate({ to: "/" + props.entityName });
    },
  });
  return (
    <div className="w-full max-w-xl rounded-md bg-primary-900 shadow-lg">
      <AutoForm
        formSchema={props.itemSchema}
        onSubmit={(data) =>
          updateEntity.mutate({ ...data, id: props.entityData.id })
        }
        values={props.itemSchema.parse(props.entityData)}
      >
        <AutoFormSubmit>Update {props.entityName}</AutoFormSubmit>
      </AutoForm>
    </div>
  );
};
