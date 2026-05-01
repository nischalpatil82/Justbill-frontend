import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'currencySymbol',
  standalone: true,
})
export class CurrencySymbolPipe implements PipeTransform {

  transform(value: number | undefined | null): string {
    // If value is null or undefined, default to 0
    const finalValue = value ?? 0;


    // Indian number formatting (₹1,23,456)
    const formattedValue = new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 0,
    }).format(finalValue);

    // Always Indian Rupee
    return `₹${formattedValue}`;
  }
}
