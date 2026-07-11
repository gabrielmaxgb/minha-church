import Link from "next/link";

import {
  AUTH_PAUSED_MESSAGE,
  AUTH_PAUSED_TITLE,
} from "@/constants/auth-access";
import { PUBLIC_ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function AuthPausedNotice() {
  return (
    <div className="mx-auto w-full max-w-md">
      <Card className="border-border/60 bg-card/80 shadow-sm backdrop-blur-sm">
        <CardContent className="flex flex-col gap-4 p-8 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            MinhaChurch
          </p>
          <h1 className="font-display text-3xl font-semibold tracking-tight text-foreground">
            {AUTH_PAUSED_TITLE}
          </h1>
          <p className="text-sm leading-relaxed text-muted-foreground">
            {AUTH_PAUSED_MESSAGE}
          </p>
          <Button asChild variant="outline" className="mt-2 w-full">
            <Link href={PUBLIC_ROUTES.home}>Voltar para o site</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
