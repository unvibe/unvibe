import { baseURL } from '../constants';
import { createClient } from './create';

export const client = createClient(baseURL);
