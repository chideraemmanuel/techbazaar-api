import z from 'zod';
import { stringSchema } from './constants';

export const URLRegex =
  /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,})))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

export const IPAddressV4Regex =
  /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/;

export const viewsUpdateSchema = z.object({
  visitor_id: stringSchema('visitor_id', 1),
  referrer: stringSchema('referrer')
    .refine((value) => URLRegex.test(value) || 'Invalid URL')
    .optional(),
  referrer_full_url: stringSchema('referrer_full_url', 1, 1000)
    .refine((value) => URLRegex.test(value) || 'Invalid URL')
    .optional(),
  ip_address: stringSchema('ip_address').refine(
    (value) => IPAddressV4Regex.test(value) || 'Invalid IP Address'
  ),
});
