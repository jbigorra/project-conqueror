import { Html } from "@elysiajs/html";

export const MainLayout = ({ head, title, children }: { head: string; title?: string; children: JSX.Element }): JSX.Element => {
  return (
    <>
      {'<!doctype html>'}
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>{title || 'Hello World!'}</title>
          {head}
        </head>
        <body>{children}</body>
      </html>
    </>
  );
};
