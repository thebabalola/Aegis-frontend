"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Calculator, TrendingUp, TrendingDown } from 'lucide-react';

interface VolatilityCalculatorProps {
  className?: string;
}

export function VolatilityCalculator({ className }: VolatilityCalculatorProps) {
  const [investment, setInvestment] = useState([10000]);
  const [timeframe, setTimeframe] = useState([30]);
  const [volatilityLevel, setVolatilityLevel] = useState([25]);

  const calculation = useMemo(() => {
    const amount = investment[0];
    const days = timeframe[0];
    const vol = volatilityLevel[0] / 100;

    const dailyVol = vol / Math.sqrt(365);
    const periodVol = dailyVol * Math.sqrt(days);

    const maxDrawdown = amount * periodVol * 2;
    const expectedRange = amount * periodVol;
    const potentialLoss = maxDrawdown * 0.5;
    const potentialGain = expectedRange * 0.7;

    return {
      maxDrawdown: maxDrawdown.toFixed(0),
      expectedRange: expectedRange.toFixed(0),
      potentialLoss: potentialLoss.toFixed(0),
      potentialGain: potentialGain.toFixed(0),
      volatilityRating: vol > 0.5 ? 'High' : vol > 0.25 ? 'Medium' : 'Low',
      ratingColor: vol > 0.5 ? 'destructive' : vol > 0.25 ? 'secondary' : 'default',
    };
  }, [investment, timeframe, volatilityLevel]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          Volatility Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Investment Amount</span>
            <span className="font-medium">${investment[0].toLocaleString()}</span>
          </div>
          <Slider
            value={investment}
            onValueChange={setInvestment}
            min={100}
            max={100000}
            step={100}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Timeframe (days)</span>
            <span className="font-medium">{timeframe[0]} days</span>
          </div>
          <Slider
            value={timeframe}
            onValueChange={setTimeframe}
            min={7}
            max={365}
            step={7}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Volatility Level</span>
            <span className="font-medium">{volatilityLevel[0]}%</span>
          </div>
          <Slider
            value={volatilityLevel}
            onValueChange={setVolatilityLevel}
            min={5}
            max={100}
            step={5}
          />
        </div>

        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Volatility Rating</span>
            <Badge variant={calculation.ratingColor as any}>{calculation.volatilityRating}</Badge>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Max Drawdown</p>
              <p className="text-lg font-bold text-red-500">${calculation.maxDrawdown}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1">Expected Range</p>
              <p className="text-lg font-bold">${calculation.expectedRange}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingDown className="w-3 h-3" /> Potential Loss
              </p>
              <p className="text-lg font-bold text-red-500">${calculation.potentialLoss}</p>
            </div>
            <div className="bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> Potential Gain
              </p>
              <p className="text-lg font-bold text-green-500">${calculation.potentialGain}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
