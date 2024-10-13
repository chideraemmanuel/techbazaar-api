import { PopulatedOrderItem } from '../models/order';

const calculateSubTotal = (items: PopulatedOrderItem[]) => {
  let subTotal = 0;

  items.forEach((item) => {
    subTotal = subTotal + item.product.price * item.quantity;
  });

  return subTotal;
};

export default calculateSubTotal;
