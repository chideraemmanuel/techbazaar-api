import { NextFunction, Request, Response } from 'express';
import validateSchema from '../lib/validate-schema';
import { viewsUpdateSchema } from '../schemas/views';
import z from 'zod';
import axios from 'axios';
import View from '../models/views';

export const updateViews = async (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  try {
    const data = validateSchema<z.infer<typeof viewsUpdateSchema>>(
      request.body,
      viewsUpdateSchema
    );

    const { visitor_id, ip_address, referrer, referrer_full_url } = data;

    const api_response = await axios.get(
      `http://ip-api.com/json/${ip_address}?fields=status,message,continent,continentCode,country,countryCode,region,regionName,city,district,zip,lat,lon,timezone,isp,org,as,query`
    );

    const {
      continent,
      continentCode,
      country,
      countryCode,
      region,
      regionName,
      city,
      district,
      zip,
      lat,
      lon,
      timezone,
      isp,
      org,
      as,
    } = api_response.data;

    const view = await View.create({
      visitor_id,
      referrer: referrer || '',
      referrer_full_url: referrer_full_url || '',
      ip_address,
      continent,
      continent_code: continentCode,
      country,
      country_code: countryCode,
      region,
      region_name: regionName,
      city,
      district,
      zip,
      lat,
      lon,
      timezone,
      isp,
      org,
      as,
    });

    response.status(201).json({ message: 'View updated successfully' });
  } catch (error: any) {
    next(error);
  }
};
