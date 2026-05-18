'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { useTranslation } from 'next-i18next';
import { useStellarWallet } from '@/components/context/StellarWalletProvider';

export default function PremiumWaitlist() {
  const { t } = useTranslation('common');
  const { wallet } = useStellarWallet();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [position, setPosition] = useState<number | null>(null);

  useEffect(() => {
    // Check if user is already on the waitlist if wallet is connected
    const checkStatus = async () => {
      if (wallet?.publicKey) {
        try {
          const response = await fetch(`/api/waitlist?walletAddress=${wallet.publicKey}`);
          if (response.ok) {
            const data = await response.json();
            if (data.joined) {
              setIsSubmitted(true);
              setPosition(data.position);
            }
          }
        } catch (err) {
          console.error('Error checking waitlist status:', err);
        }
      }
    };
    checkStatus();
  }, [wallet?.publicKey]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          walletAddress: wallet?.publicKey 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        setPosition(data.position);
        setEmail('');
      } else {
        setError(data.error || 'Failed to join waitlist');
      }
    } catch (error) {
      console.error('Error submitting to waitlist:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const benefits = [
    {
      title: t('waitlist.benefits.earlyAccess.title'),
      description: t('waitlist.benefits.earlyAccess.description'),
      icon: '🚀',
    },
    {
      title: t('waitlist.benefits.exclusiveDiscounts.title'),
      description: t('waitlist.benefits.exclusiveDiscounts.description'),
      icon: '💎',
    },
    {
      title: t('waitlist.benefits.prioritySupport.title'),
      description: t('waitlist.benefits.prioritySupport.description'),
      icon: '⭐',
    },
    {
      title: t('waitlist.benefits.betaFeatures.title'),
      description: t('waitlist.benefits.betaFeatures.description'),
      icon: '🔮',
    },
    {
      title: t('waitlist.benefits.communityAccess.title'),
      description: t('waitlist.benefits.communityAccess.description'),
      icon: '🌟',
    },
    {
      title: t('waitlist.benefits.enhancedAnalytics.title'),
      description: t('waitlist.benefits.enhancedAnalytics.description'),
      icon: '📊',
    },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 nebula-bg pt-20">
        <div className="max-w-2xl w-full text-center">
          <Card className="p-12 border-cosmic-purple/50 bg-cosmic-dark/40 backdrop-blur-xl">
            <div className="mb-8">
              <div className="text-6xl mb-4 animate-float">✨</div>
              <h1 className="text-4xl font-bold mb-4 glow-text">{t('waitlist.success.title')}</h1>
              <p className="text-xl text-cosmic-cyan mb-8">
                {t('waitlist.success.message')}
              </p>
              {position && (
                <div className="inline-block px-6 py-2 bg-cosmic-purple/20 rounded-full border border-cosmic-purple/30 mb-8">
                  <span className="text-cosmic-nebula font-bold text-lg">
                    Position: #{position}
                  </span>
                </div>
              )}
            </div>
            <div className="space-y-4">
              <p className="text-cosmic-purple">
                {t('waitlist.success.checkEmail')}
              </p>
              <Button 
                onClick={() => setIsSubmitted(false)}
                className="mx-auto"
                variant="outline"
              >
                {t('waitlist.success.addAnother')}
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen nebula-bg pt-20">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="mb-6">
            <div className="inline-flex items-center px-4 py-2 bg-cosmic-purple/20 rounded-full border border-cosmic-purple/30 mb-6 animate-pulse-slow">
              <span className="text-cosmic-nebula text-sm font-semibold">{t('waitlist.limitedSpots')}</span>
            </div>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 glow-text">
            {t('waitlist.title')}
            <span className="block text-cosmic-nebula">{t('waitlist.subtitle')}</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-cosmic-cyan mb-8 max-w-3xl mx-auto">
            {t('waitlist.description')}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center mb-8">
            <div className="flex items-center gap-2 text-cosmic-purple">
              <span className="text-2xl">👥</span>
              <span className="font-semibold">{t('waitlist.peopleWaiting')}</span>
            </div>
            <div className="flex items-center gap-2 text-cosmic-purple">
              <span className="text-2xl">⏱️</span>
              <span className="font-semibold">{t('waitlist.earlyAccess')}</span>
            </div>
          </div>
        </div>

        {/* Email Signup Form */}
        <div className="max-w-md mx-auto mb-24" id="email-form">
          <Card className="text-center p-8 border-cosmic-purple/40 bg-cosmic-dark/40 backdrop-blur-lg">
            <h2 className="text-2xl font-bold mb-4 text-cosmic-nebula">{t('waitlist.reserveSpot')}</h2>
            <p className="text-cosmic-cyan mb-6">
              {t('waitlist.reserveDescription')}
            </p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('waitlist.emailPlaceholder')}
                required
                className="w-full px-4 py-3 bg-cosmic-dark/50 border border-cosmic-purple/30 rounded-lg text-white placeholder-cosmic-purple/50 focus:outline-none focus:border-cosmic-purple focus:ring-2 focus:ring-cosmic-purple/20 transition-smooth"
              />
              
              {error && (
                <p className="text-red-400 text-sm mt-2">{error}</p>
              )}

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? t('waitlist.joining') : t('waitlist.joinButton')}
              </Button>
            </form>
            
            <p className="text-xs text-cosmic-purple/60 mt-4">
              {t('waitlist.noSpam')}
            </p>
          </Card>
        </div>

        {/* Benefits Section */}
        <div className="mb-24">
          <h2 className="text-4xl font-bold text-center mb-16 glow-text">
            {t('waitlist.premiumBenefits')}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {benefits.map((benefit, index) => (
              <Card key={index} className="text-center group hover:scale-105 transition-smooth p-6 border-cosmic-purple/20">
                <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-2xl font-bold mb-4 text-cosmic-nebula">
                  {benefit.title}
                </h3>
                <p className="text-cosmic-cyan text-lg">
                  {benefit.description}
                </p>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="inline-block p-12 bg-gradient-to-r from-cosmic-purple/10 to-cosmic-blue/10 rounded-3xl border border-cosmic-purple/30 backdrop-blur-md">
            <h2 className="text-3xl font-bold mb-4 text-cosmic-nebula">
              {t('waitlist.readyTitle')}
            </h2>
            <p className="text-xl text-cosmic-cyan mb-8 max-w-2xl mx-auto">
              {t('waitlist.readyDescription')}
            </p>
            <Button size="lg" onClick={() => document.getElementById('email-form')?.scrollIntoView({ behavior: 'smooth' })}>
              {t('waitlist.joinNowButton')}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
