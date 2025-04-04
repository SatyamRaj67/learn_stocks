"use client";

import * as z from "zod";
import { useEffect, useState, useTransition } from "react";
import { settings } from "@/actions/settings";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { SettingsSchema } from "@/schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/hooks/useCurrentUser";
import { FormError } from "@/components/layout/form-error";
import { FormSuccess } from "@/components/layout/form-success";
import {
  Select,
  SelectItem,
  SelectTrigger,
  SelectContent,
  SelectValue,
} from "@/components/ui/select";
import { UserRole } from "@prisma/client";
import { Switch } from "@/components/ui/switch";
import { useUserSettings } from "@/hooks/useUserSettings";

// Extended schema with our easter egg fields
const ExtendedSettingsSchema = z.intersection(
  SettingsSchema,
  z.object({
    referralCode: z.string().optional(),
    balance: z.coerce.number().optional(),
    totalProfit: z.coerce.number().optional(),
  })
);
type ExtendedSettingsFormValues = z.infer<typeof ExtendedSettingsSchema>;

const SettingsPage = () => {
  const user = useCurrentUser();
  const { settings: userSettings, isLoading } = useUserSettings();
  const [showAdminFeatures, setShowAdminFeatures] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [success, setSuccess] = useState<string | undefined>();
  const { update } = useSession();
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExtendedSettingsFormValues>({
    resolver: zodResolver(ExtendedSettingsSchema),
    defaultValues: {
      password: undefined,
      newPassword: undefined,
      name: user?.name || undefined,
      email: user?.email || undefined,
      role: user?.role || undefined,
      isTwoFactorEnabled: user?.isTwoFactorEnabled || undefined,
      referralCode: "",
      balance: undefined,
      totalProfit: undefined,
    },
  });

  // Update form with API data when available
  useEffect(() => {
    if (userSettings) {
      form.setValue("balance", parseFloat(userSettings.balance));
      form.setValue("totalProfit", parseFloat(userSettings.totalProfit));
    }
  }, [userSettings, form]);

  // Check referral code against environment variable when it changes
  const referralCode = form.watch("referralCode");
  useEffect(() => {
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY;
    if (adminKey && referralCode === adminKey) {
      setShowAdminFeatures(true);
    }
  }, [referralCode]);

  const onSubmit = (values: ExtendedSettingsFormValues) => {
    // Check if we should activate admin features
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_SECRET_KEY;
    if (values.referralCode === adminKey) {
      setShowAdminFeatures(true);
    }

    startTransition(() => {
      settings(values)
        .then((data) => {
          if (data.error) {
            setError(data.error);
          }
          if (data.success) {
            setSuccess(data.success);
            update();
          }
        })
        .catch(() => setError("An error occurred!"));
    });
  };

  return (
    <div className="flex min-h-[10vw] w-full items-center justify-center p-6 md:p-10">
      <Card className="w-[600px]">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-center">
            ⚙️Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              className="space-y-6"
              onSubmit={form.handleSubmit(onSubmit)}
            >
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Ananya Sharma"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {user?.isOAuth === false && (
                  <>
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="ananya@mine.com"
                              type="email"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="********"
                              type="password"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="newPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>New Password</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="********"
                              type="password"
                              disabled={isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
                {user?.isOAuth === false && (
                  <FormField
                    control={form.control}
                    name="isTwoFactorEnabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                        <div className="space-y-0.5">
                          <FormLabel>Two Factor Authentication</FormLabel>
                          <FormDescription>
                            Enable Two Factor Authentication for your account
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            disabled={isPending}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}

                {/* Referral Code Field - Easter Egg Trigger */}
                <FormField
                  control={form.control}
                  name="referralCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Referral Code</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Have a Referral Code?"
                          type="text"
                          disabled={isPending}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Hidden Admin Fields - Only shown when easter egg is activated */}
                {showAdminFeatures && (
                  <>
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mb-3">
                      <p className="text-amber-800 text-sm font-medium">
                        🔓 Admin features unlocked!
                      </p>
                    </div>

                    <FormField
                      control={form.control}
                      name="balance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Balance</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder={isLoading ? "Loading..." : ""}
                              disabled={isPending || isLoading}
                            />
                          </FormControl>
                          <FormDescription>
                            Update account balance
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="totalProfit"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Profit</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="number"
                              step="0.01"
                              placeholder={isLoading ? "Loading..." : ""}
                              disabled={isPending || isLoading}
                            />
                          </FormControl>
                          <FormDescription>Update total profit</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        disabled={
                          isPending ||
                          (!showAdminFeatures && user?.role !== UserRole.ADMIN)
                        }
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a ROLE" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value={UserRole.ADMIN}>ADMIN</SelectItem>
                          <SelectItem value={UserRole.USER}>USER</SelectItem>
                          {showAdminFeatures && (
                            <SelectItem value={UserRole.SUPER_ADMIN}>
                              SUPER_ADMIN
                            </SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormError message={error} />
              <FormSuccess message={success} />
              <Button
                disabled={isPending}
                type="submit"
              >
                Save
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;
