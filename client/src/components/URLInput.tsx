import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";

const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL")
});

type UrlFormValues = z.infer<typeof urlSchema>;

interface URLInputProps {
  onSubmit: (url: string) => void;
  isProcessing: boolean;
}

export default function URLInput({ onSubmit, isProcessing }: URLInputProps) {
  const form = useForm<UrlFormValues>({
    resolver: zodResolver(urlSchema),
    defaultValues: {
      url: ""
    }
  });

  const handleSubmit = (values: UrlFormValues) => {
    onSubmit(values.url);
  };

  return (
    <div className="mb-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <div className="flex flex-col md:flex-row gap-3">
            <FormField
              control={form.control}
              name="url"
              render={({ field }) => (
                <FormItem className="flex-grow">
                  <FormControl>
                    <div className="relative">
                      <Input
                        {...field}
                        className="w-full bg-background border border-gray-800 focus:border-primary rounded-lg py-3 px-4 text-gray-300 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                        placeholder="Paste YouTube, Vimeo, or social media video URL here..."
                        disabled={isProcessing}
                      />
                      <button 
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
                        onClick={() => navigator.clipboard.readText().then(text => {
                          form.setValue("url", text);
                        })}
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button 
              type="submit"
              disabled={isProcessing}
              className="bg-gradient-to-r from-primary to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white py-3 px-6 rounded-lg font-medium transition-all whitespace-nowrap"
            >
              {isProcessing ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : "Generate Captions"}
            </Button>
          </div>
        </form>
      </Form>
      <p className="text-xs text-muted-foreground mt-2">
        Supported platforms: YouTube, Vimeo, Twitter, Facebook, Instagram, TikTok, and more
      </p>
    </div>
  );
}
