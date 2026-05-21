import { describe, expect, it } from 'vitest';
import {
  calculateInstallment,
  calculateTotalPrice,
  formatPrice,
  type CarConfiguration,
} from './configuratorStore';

const baseConfig: CarConfiguration = {
  exteriorColor: 'glacier-blue',
  interiorColor: 'carbon-black',
  wheelType: 'aero',
  optionals: [],
};

describe('calculateTotalPrice', () => {
  it('returns base price for default configuration', () => {
    expect(calculateTotalPrice(baseConfig)).toBe(40_000);
  });

  it('adds sport wheels surcharge', () => {
    expect(calculateTotalPrice({ ...baseConfig, wheelType: 'sport' })).toBe(42_000);
  });

  it('adds optional prices', () => {
    expect(
      calculateTotalPrice({ ...baseConfig, optionals: ['precision-park'] })
    ).toBe(45_500);
    expect(
      calculateTotalPrice({ ...baseConfig, optionals: ['flux-capacitor'] })
    ).toBe(45_000);
    expect(
      calculateTotalPrice({
        ...baseConfig,
        optionals: ['precision-park', 'flux-capacitor'],
      })
    ).toBe(50_500);
  });

  it('combines sport wheels and optionals', () => {
    expect(
      calculateTotalPrice({
        ...baseConfig,
        wheelType: 'sport',
        optionals: ['precision-park', 'flux-capacitor'],
      })
    ).toBe(52_500);
  });

  it('ignores invalid optionals', () => {
    expect(
      calculateTotalPrice({
        ...baseConfig,
        optionals: ['invalid' as 'precision-park'],
      })
    ).toBe(40_000);
  });
});

describe('calculateInstallment', () => {
  it('calculates 12x with 2% monthly compound interest', () => {
    const total = 40_000;
    const monthlyRate = 0.02;
    const months = 12;
    const expected =
      Math.round(
        ((total * monthlyRate * Math.pow(1 + monthlyRate, months)) /
          (Math.pow(1 + monthlyRate, months) - 1)) *
          100
      ) / 100;

    expect(calculateInstallment(total)).toBe(expected);
  });

  it('scales with total price', () => {
    expect(calculateInstallment(20_000)).toBe(calculateInstallment(40_000) / 2);
  });
});

describe('formatPrice', () => {
  it('formats values as BRL currency in pt-BR locale', () => {
    const normalize = (s: string) => s.replace(/\s/g, ' ');
    expect(normalize(formatPrice(40_000))).toBe('R$ 40.000,00');
    expect(normalize(formatPrice(1234.56))).toBe('R$ 1.234,56');
    expect(normalize(formatPrice(0))).toBe('R$ 0,00');
  });
});
