"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DotsHorizontalIcon } from "@radix-ui/react-icons";
import { useRouter } from "@tanstack/react-router";
import { Row } from "@tanstack/react-table";
import {CheckCheck, Eye, Forward, Pencil, Trash} from "lucide-react";
import {toast} from "react-toastify";

interface DataTableRowActionsProps<TData> {
  row: Row<TData>;
  onEdit?: (input: TData) => void;
  onDelete?: (id: number) => void;
  onSelect?: (id: number) => void;
  onHandled?: (id: number) => void;
}

export function DataTableRowActions<TData>({
  row,
  onEdit,
  onDelete,
    onHandled,
}: DataTableRowActionsProps<TData>) {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex h-8 w-8 p-0 data-[state=open]:bg-gray-800 outline-none"
        >
          <DotsHorizontalIcon className="h-4 w-4" />
          <span className="sr-only">Open menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[160px]">
        <DropdownMenuItem onClick={() => onEdit?.(row.original)}>
          Edit
          <Pencil size="16" />
        </DropdownMenuItem>
         {/*TODO: fix this redirection */}
        <DropdownMenuItem
          onClick={() =>
            router.navigate({
              to: `/invoice-details/${row.original.id}`,
            })
          }
        >
          View
          <Eye size="16" />
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            router.navigate({
              to: `/invoice/${row.original.id}`,
            })
          }
        >
          Share
          <Forward size="16" />
        </DropdownMenuItem>
        <DropdownMenuItem
            onClick={() => onHandled?.(row.original.id)}
        >
            Mark as handled
            <CheckCheck size="16" />
        </DropdownMenuItem>
        {/* @ts-expect-error TODO: fix this */}
        <DropdownMenuItem onClick={() => {
          onDelete?.(row.original.id)
          toast.success("Invoice has been deleted!")
        }}>
          Delete
          <Trash size="16" />
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
