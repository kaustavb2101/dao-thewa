/**
 * ดาวเทวา — ThaiNumeralText
 * Converts ASCII digits to Thai numerals ๐๑๒๓๔๕๖๗๘๙
 */
import React from 'react';
import {Text, TextStyle} from 'react-native';

const THAI = ['๐', '๑', '๒', '๓', '๔', '๕', '๖', '๗', '๘', '๙'];

export function toThaiNumerals(str: string | number): string {
  return String(str).replace(/\d/g, d => THAI[parseInt(d)]);
}

interface Props {
  children: string | number;
  style?: TextStyle | TextStyle[];
}

export function ThaiNumeralText({children, style}: Props) {
  return <Text style={style}>{toThaiNumerals(children)}</Text>;
}
