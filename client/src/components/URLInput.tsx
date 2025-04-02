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
    <div className="mb-0">
      <div className="rounded-lg border-2 border-gray-500 hover:border-primary hover:bg-primary/5 transition-all p-6">
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-primary/20 p-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-6 w-6 text-primary" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-white">Enter Video URL</h3>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="url"
                render={({ field }) => (
                  <FormItem className="flex-grow">
                    <FormControl>
                      <div className="relative">
                        <Input
                          {...field}
                          className="w-full bg-background/50 border border-gray-700 focus:border-primary rounded-lg py-5 px-4 text-gray-200 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                          placeholder="Paste YouTube, Vimeo, or social media video URL here..."
                          disabled={isProcessing}
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-primary/20 hover:bg-primary/30 text-primary p-2 rounded-full transition-colors"
                          onClick={() => navigator.clipboard.readText().then(text => {
                            form.setValue("url", text);
                          })}
                          title="Paste from clipboard"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end">
                <Button 
                  type="submit"
                  disabled={isProcessing}
                  size="lg"
                  className="bg-gradient-to-r from-primary to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-colors"
                >
                  {isProcessing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4 mr-2" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path 
                          strokeLinecap="round" 
                          strokeLinejoin="round" 
                          strokeWidth={2} 
                          d="M14 5l7 7m0 0l-7 7m7-7H3" 
                        />
                      </svg>
                      Generate Captions
                    </>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </Form>
        <div className="mt-4 flex items-center space-x-2">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-4 w-4 text-primary" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
            />
          </svg>
          <p className="text-xs text-gray-400">
            Supported platforms: YouTube, Vimeo, Twitter, Facebook, Instagram, TikTok and more
          </p>
        </div>
      </div>
    </div>
  );
}
