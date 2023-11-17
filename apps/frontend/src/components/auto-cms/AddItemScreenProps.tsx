import AutoForm, { AutoFormSubmit } from "@/components/auto-form";
import { trpcClient } from "@/features/trpc-client.ts";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { z } from "zod";

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
      await navigate({ to: "/" + props.entityName });
      props.onAdd?.();
    },
  });
  return (
    <div className="w-full max-w-xl rounded-lg bg-white p-4 shadow-lg">
      <div className="mt-4 border-t pt-4"></div>
      <AutoForm formSchema={props.itemSchema} onSubmit={addItem.mutate}>
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
    <div className="w-full max-w-xl rounded-lg bg-white p-4 shadow-lg">
      <div className="mt-4 border-t pt-4"></div>
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
