import { z } from "zod";
import { isFrenchPhone, isFrenchPostalCode } from "./checkout-fr";

export type CheckoutFields = {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  zip: string;
  address: string;
  notes: string;
};

const emailSchema = z.string().email().max(254);
const namePattern = /^[\p{L}\p{M}\s.'’\-]+$/u;

export function validateCheckout(fields: CheckoutFields): Partial<CheckoutFields> {
  const errors: Partial<CheckoutFields> = {};
  for (const field of ["firstName", "lastName"] as const) {
    const value = fields[field].trim();
    const label = field === "firstName" ? "prénom" : "nom";
    if (!value) errors[field] = `Saisissez votre ${label}.`;
    else if (value.length > 100) errors[field] = `Votre ${label} doit contenir au maximum 100 caractères.`;
    else if (!namePattern.test(value) || !/\p{L}/u.test(value)) errors[field] = `Vérifiez votre ${label} : utilisez des lettres, sans chiffres ni caractères spéciaux.`;
  }
  if (!fields.phone.trim()) errors.phone = "Saisissez votre numéro de téléphone.";
  else if (!isFrenchPhone(fields.phone)) errors.phone = "Numéro français invalide. Exemple : 06 12 34 56 78 ou +33 6 12 34 56 78.";
  if (!fields.email.trim()) errors.email = "Saisissez votre email pour recevoir la confirmation de commande.";
  else if (!emailSchema.safeParse(fields.email.trim()).success) errors.email = "Adresse email invalide. Exemple : vous@exemple.fr.";
  if (!fields.city.trim()) errors.city = "Saisissez votre ville de livraison.";
  else if (fields.city.trim().length > 100) errors.city = "Le nom de la ville doit contenir au maximum 100 caractères.";
  else if (!/\p{L}/u.test(fields.city) || /[<>@]/.test(fields.city)) errors.city = "Vérifiez le nom de votre ville. Exemple : Paris.";
  if (!fields.zip.trim()) errors.zip = "Saisissez votre code postal.";
  else if (!isFrenchPostalCode(fields.zip)) errors.zip = "Le code postal doit contenir exactement 5 chiffres. Exemple : 75002.";
  if (!fields.address.trim()) errors.address = "Saisissez votre adresse de livraison complète.";
  else if (fields.address.trim().length > 200) errors.address = "L’adresse doit contenir au maximum 200 caractères. Utilisez le complément d’adresse si nécessaire.";
  if (fields.notes.trim().length > 2000) errors.notes = "Le complément d’adresse doit contenir au maximum 2 000 caractères.";
  return errors;
}
