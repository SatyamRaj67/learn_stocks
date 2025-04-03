"use client";

import React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Loader2 } from "lucide-react";

// Define the stock schema using Zod
const stockSchema = z.object({
  id: z.string().optional(),
  symbol: z
    .string()
    .min(1, "Symbol is required")
    .max(10, "Symbol must be 10 characters or less")
    .toUpperCase(),
  name: z
    .string()
    .min(1, "Company name is required")
    .max(100, "Name must be 100 characters or less"),
  sector: z.string().optional().nullable(),
  currentPrice: z.coerce.number().min(0, "Price cannot be negative").default(0),
  previousClose: z.coerce
    .number()
    .min(0, "Previous close cannot be negative")
    .optional()
    .nullable(),
  volume: z.coerce.number().min(0, "Volume cannot be negative").default(0),
  marketCap: z.coerce
    .number()
    .min(0, "Market cap cannot be negative")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
  isFrozen: z.boolean().default(false),
});

type StockFormValues = z.infer<typeof stockSchema>;

// Define sectors for the dropdown
const sectors = [
  "Technology",
  "Healthcare",
  "Financials",
  "Consumer Discretionary",
  "Consumer Staples",
  "Industrials",
  "Energy",
  "Materials",
  "Utilities",
  "Real Estate",
  "Communication Services",
];

interface StockEditDialogProps {
  stock: StockFormValues | null;
  open: boolean;
  onClose: () => void;
}

export function StockEditDialog({
  stock,
  open,
  onClose,
}: StockEditDialogProps) {
  const queryClient = useQueryClient();
  const isNewStock = !stock?.id;

  const form = useForm<StockFormValues>({
    resolver: zodResolver(stockSchema),
    defaultValues: stock || {
      symbol: "",
      name: "",
      sector: "",
      currentPrice: 0,
      volume: 0,
      isActive: true,
      isFrozen: false,
    },
  });

  // Set form values when stock changes
  React.useEffect(() => {
    if (stock) {
      form.reset(stock);
    }
  }, [stock, form]);

  const mutation = useMutation({
    mutationFn: async (data: StockFormValues) => {
      if (isNewStock) {
        // Create new stock
        return axios.post("/api/admin/stocks", data);
      } else {
        // Update existing stock
        return axios.put(`/api/admin/stocks/${data.id}`, data);
      }
    },
    onSuccess: () => {
      // Invalidate and refetch the stocks query
      queryClient.invalidateQueries({ queryKey: ["admin-stocks"] });
      toast.success(
        isNewStock ? "Stock created successfully" : "Stock updated successfully"
      );
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.error || "Failed to save stock");
    },
  });

  const onSubmit = (data: StockFormValues) => {
    mutation.mutate(data);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => !open && onClose()}
    >
      <DialogContent className="max-w-md overflow-y-auto max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isNewStock ? "Create New Stock" : "Edit Stock"}
          </DialogTitle>
          <DialogDescription>
            {isNewStock
              ? "Add a new stock to the market."
              : "Make changes to the stock information."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="AAPL"
                        {...field}
                        disabled={!isNewStock && !!stock?.id} // Only allow editing symbol for new stocks
                        onChange={(e) =>
                          field.onChange(e.target.value.toUpperCase())
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="currentPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Price</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company Name</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Apple Inc."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value || ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select sector" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">None</SelectItem>
                        {sectors.map((sector) => (
                          <SelectItem
                            key={sector}
                            value={sector}
                          >
                            {sector}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="1000000"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="previousClose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Previous Close</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? null
                              : Number(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="marketCap"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Market Cap</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="1000000000"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => {
                          const value =
                            e.target.value === ""
                              ? null
                              : Number(e.target.value);
                          field.onChange(value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Active</FormLabel>
                      <FormDescription>
                        Stocks that are active can be traded
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isFrozen"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel>Frozen</FormLabel>
                      <FormDescription>
                        Frozen stocks cannot be traded
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                type="button"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={mutation.isPending}
              >
                {mutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save Changes"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
