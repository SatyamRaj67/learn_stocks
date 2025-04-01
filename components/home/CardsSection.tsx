import { IconTrendingDown, IconTrendingUp } from "@tabler/icons-react";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export type CardData = {
  description: string;
  value: string;
  badge: string;
  footerTitle: string;
  footerDescription: string;
};

interface SectionCardsProps {
  cards: CardData[];
}

export function SectionCards({ cards }: SectionCardsProps) {
  const isTrendPositive = (badge: string): boolean => {
    const numericValue = parseFloat(badge.replace(/[^0-9.-]/g, ""));
    return numericValue >= 0;
  };

  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-background grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {cards.map((card, index) => {
        const isPositive = isTrendPositive(card.badge);

        return (
          <Card
            key={index}
            className="@container/card"
          >
            <CardHeader>
              <CardDescription>{card.description}</CardDescription>
              <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl whitespace-nowrap">
                {card.value}
              </CardTitle>
              <CardAction>
                <Badge
                  variant="outline"
                  className={isPositive ? "text-emerald-500" : "text-red-500"}
                >
                  {isPositive ? <IconTrendingUp /> : <IconTrendingDown />}
                  {card.badge}
                </Badge>
              </CardAction>
            </CardHeader>
            <CardFooter className="flex-col items-start gap-1.5 text-sm">
              <div className="line-clamp-1 flex gap-2 font-medium">
                {card.footerTitle}{" "}
                <span
                  className={isPositive ? "text-emerald-500" : "text-red-500"}
                >
                  {isPositive ? (
                    <IconTrendingUp className="size-4" />
                  ) : (
                    <IconTrendingDown className="size-4" />
                  )}
                </span>
              </div>
              <div className="text-muted-foreground">
                {card.footerDescription}
              </div>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}
