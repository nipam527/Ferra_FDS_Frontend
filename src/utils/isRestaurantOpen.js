// src/utils/isRestaurantOpen.js

// Returns true only if BOTH the vendor hasn't manually closed the restaurant
// AND the current time falls within their set opening hours.
// Handles overnight hours too (e.g. open: "18:00", close: "02:00").
export function isRestaurantOpenNow(restaurant) {
  if (!restaurant?.isOpen) return false; // vendor manually paused

  const { open, close } = restaurant.openingHours || {};
  if (!open || !close) return restaurant.isOpen; // no hours set, fall back to manual toggle only

  const now = new Date();
  const [openH, openM] = open.split(":").map(Number);
  const [closeH, closeM] = close.split(":").map(Number);

  const nowMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;

  if (closeMinutes > openMinutes) {
    // normal same-day hours, e.g. 09:00–22:00
    return nowMinutes >= openMinutes && nowMinutes < closeMinutes;
  } else {
    // overnight hours, e.g. 18:00–02:00 (closes after midnight)
    return nowMinutes >= openMinutes || nowMinutes < closeMinutes;
  }
}