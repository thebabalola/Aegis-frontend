"use client";

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Shield, AlertTriangle } from 'lucide-react';

interface HedgingSimulatorProps {
  className?: string;
}

export function HedgingSimulator({ className }: HedgingSimulatorProps) {
  const [hedgeRatio, setHedgeRatio] = useState([50]);
  const [volatility, setVolatility] = useState([25]);

  const simulation = useMemo(() => {
    const ratio = hedgeRatio[0] / 100;
    const vol = volatility[0] / 100;

    const unhedgedRisk = vol * 100;
    const hedgedRisk = unhedgedRisk * (1 - ratio * 0.8);
    const costImpact = ratio * 2.5;
    const netBenefit = unhedgedRisk - hedgedRisk - costImpact;

    return {
      unhedgedRisk: unhedgedRisk.toFixed(1),
      hedgedRisk: hedgedRisk.toFixed(1),
      costImpact: costImpact.toFixed(2),
      netBenefit: netBenefit.toFixed(1),
      riskReduction: ((unhedgedRisk - hedgedRisk) / unhedgedRisk * 100).toFixed(0),
    };
  }, [hedgeRatio, volatility]);

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Hedging Simulator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Hedge Ratio</span>
            <span className="font-medium">{hedgeRatio[0]}%</span>
          </div>
          <Slider
            value={hedgeRatio}
            onValueChange={setHedgeRatio}
            max={100}
            step={5}
          />
        </div>

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Expected Volatility</span>
            <span className="font-medium">{volatility[0]}%</span>
          </div>
          <Slider
            value={volatility}
            onValueChange={setVolatility}
            max={100}
            step={5}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 pt-4 border-t">
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Unhedged Risk</p>
            <p className="text-lg font-bold text-red-500">{simulation.unhedgedRisk}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Hedged Risk</p>
            <p className="text-lg font-bold text-green-500">{simulation.hedgedRisk}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Cost Impact</p>
            <p className="text-lg font-bold">{simulation.costImpact}%</p>
          </div>
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Net Benefit</p>
            <p className={`text-lg font-bold ${parseFloat(simulation.netBenefit) >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {simulation.netBenefit}%
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <TrendingUp className="w-4 h-4 text-primary" />
          <span className="text-muted-foreground">
            Risk reduction: <span className="font-medium text-foreground">{simulation.riskReduction}%</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
