# Paiement en ligne et livraison des abonnements

## État de l’intégration

Stripe Checkout est intégré à la création et à la confirmation des commandes existantes. Prisma/Neon et Resend sont réutilisés. La migration additive a été appliquée à la base configurée pendant l’implémentation. Aucun paiement réel ni email client n’a été envoyé pendant les tests.

Les clés Stripe et Resend sont absentes de l’environnement actuellement configuré. Le paiement par carte reste désactivé jusqu’à la configuration. Le paiement à la livraison reste disponible.

Il s’agit du règlement ponctuel d’une commande, suivi de l’envoi des informations d’abonnement. Cette intégration ne crée pas de prélèvements récurrents. Aucun fournisseur de génération d’abonnements n’existe dans le projet : les informations sont saisies dans l’administration.

## Variables d’environnement

Dans `.env.local` pour le développement et dans l’environnement de l’hébergement pour la production :

```dotenv
# Nouvelles variables, exclusivement côté serveur
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Variables existantes réutilisées
JWT_SECRET=une-cle-aleatoire-longue-et-privee
NEXT_PUBLIC_SITE_URL=http://localhost:3000
RESEND_API_KEY=re_...
RESEND_FROM=ElectroShop-Tech <commandes@votre-domaine-verifie.com>
```

En production, `NEXT_PUBLIC_SITE_URL` doit être l’origine HTTPS du site. Seule cette URL est publique. Aucune clé Stripe publique n’est nécessaire pour Checkout hébergé. Ne préfixez aucune clé secrète par `NEXT_PUBLIC_`. Redémarrez le serveur après configuration.

Le sender Resend doit être vérifié dans votre compte. `PAYMENT_WEBHOOK_SECRET`, utilisé par l’ancien scaffold générique, est remplacé par `STRIPE_WEBHOOK_SECRET`.

## Base de données

Fichier SQL complet : `prisma/migrations/20261003000100_online_payments/migration.sql`.

```powershell
npx.cmd prisma migrate deploy
npx.cmd prisma generate
```

La migration réutilise `paymentStatus` et `paidAt`. Elle ajoute les informations de paiement et de livraison email, ainsi que `PaymentCheckout` et `PaymentWebhookEvent`. Elle ne supprime aucune colonne ni commande.

`paymentAmount` et le montant d’une tentative Checkout sont des entiers en centimes. L’administration et les pages client les convertissent en euros. `paymentCurrency` vaut `EUR`, conformément aux prix affichés actuellement. Ne modifiez pas cette devise pour des commandes existantes déjà associées à Checkout.

La commande reste compatible avec le workflow logistique existant : son **paymentStatus** devient `PAID`. Une commande `PENDING` devient `CONFIRMED`; les statuts de préparation/livraison ne sont pas écrasés. `PAID` n’est pas ajouté à l’énumération des statuts logistiques.

## Configuration du webhook Stripe

Dans Stripe Workbench → Webhooks, créez une destination pour votre propre compte :

```text
https://votre-domaine.com/api/payments/webhook
```

Sélectionnez les événements snapshot suivants :

- `checkout.session.completed`
- `checkout.session.async_payment_succeeded`
- `checkout.session.async_payment_failed`
- `checkout.session.expired`

Utilisez l’API `2026-09-30.endive`, correspondant au SDK officiel Stripe 23 installé. Copiez le signing secret de **cette destination** dans `STRIPE_WEBHOOK_SECRET`. La clé API et le webhook doivent appartenir au même compte et au même mode test/live. Les sessions acceptent les cartes éligibles activées dans votre compte Stripe.

Pour tester localhost avec Stripe CLI :

```powershell
stripe login
stripe listen --events checkout.session.completed,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed,checkout.session.expired --forward-to localhost:3000/api/payments/webhook
```

Utilisez le `whsec_...` affiché par ce listener pour le développement. Il est différent du secret d’une destination hébergée. Créez une commande dans le site puis payez **sa véritable session Checkout en mode test**. Un simple `stripe trigger checkout.session.completed` ne contient pas les métadonnées/tentatives de cette commande et ne constitue pas un test de ce workflow.

Références officielles : [webhooks Stripe](https://docs.stripe.com/webhooks), [Checkout Sessions](https://docs.stripe.com/api/checkout/sessions/create), [idempotence Resend](https://resend.com/docs/dashboard/emails/idempotency-keys).

## Parcours client et protections

1. Le client crée sa commande normalement, avec les prix produits et frais calculés côté serveur. Les produits absents sont refusés.
2. Il choisit la carte, ou utilise « Payer maintenant » sur la confirmation de commande lorsqu’elle est disponible.
3. Le serveur vérifie l’accès : compte propriétaire ou cookie signé propre à la commande, délivré lors de sa création. Un identifiant de commande seul n’autorise pas un paiement ni la lecture de l’email.
4. Le serveur relit le montant en base et crée une session avec `orderId` et la génération de tentative dans ses métadonnées. Une tentative en cours est réutilisée. Les doubles clics partagent la même clé d’idempotence Stripe.
5. Stripe héberge le formulaire bancaire. Le montant est agrégé afin d’inclure exactement les promotions et frais de la commande. Les conversions adaptatives et nouveaux codes promo Checkout sont désactivés.
6. Le webhook vérifie la signature sur le corps brut, relit la session Stripe, et vérifie le montant, la devise, la commande, la tentative et la référence bancaire. La mise à jour et l’enregistrement de l’événement sont transactionnels et sérialisés par commande.
7. Une commande payée ne peut pas créer une nouvelle session. Une session achevée dont le paiement reste en attente bloque une nouvelle tentative. Une tentative expirée ou définitivement échouée peut être renouvelée.
8. `/payment/success` consulte uniquement l’état enregistré sur le serveur. Tant que le webhook n’a pas confirmé, la page annonce une vérification en cours, puis permet de vérifier à nouveau. Elle ne valide jamais elle-même le paiement.
9. La page affiche le numéro, le montant payé et l’email; elle annonce la livraison de l’abonnement **par email**. Une fois envoyé, elle affiche cet état.
10. `/payment/cancel` permet de revenir à la commande et de réessayer. Aucune visite de cette page, annulation ou expiration ne marque une commande comme payée.

Le bouton a un état de chargement, se désactive pendant sa requête et affiche les erreurs. La persistance de l’idempotence côté serveur protège aussi les clics rapides avant le rafraîchissement de l’interface.

Les commandes invitées utilisent le navigateur où elles ont été créées; le cookie expire après 30 jours. Les commandes invitées créées avant cette intégration n’ont pas ce cookie et nécessitent une vérification par l’équipe. Ne partagez pas des tokens de paiement dans des URLs.

Une tentative dont la création est restée ambiguë pendant plus de 23 heures exige une vérification dans Stripe plutôt que de risquer une deuxième session après expiration de la clé d’idempotence. Les totaux inférieurs à 0,50 € ne peuvent pas être réglés avec cette configuration Stripe.

## Administration et email

Ouvrez Administration → Commandes → détail d’une commande. Le nouveau panneau affiche numéro, email, prestataire, référence, montant, date de paiement et statut/date de livraison de l’abonnement.

- Entrez les identifiants, lien d’accès, durée et instructions dans « Informations de l’abonnement ».
- « Enregistrer les informations » conserve le brouillon. Si elles sont prêtes avant le paiement, le webhook les envoie automatiquement après confirmation.
- Si le paiement est déjà confirmé, cliquez sur « Envoyer l’abonnement par email ».
- L’action refuse l’envoi avant paiement et pour une commande annulée.
- Le sender, destinataire et modèle sont construits côté serveur. Le texte d’abonnement est échappé dans le HTML.
- Les informations deviennent immuables dès la première tentative d’envoi pour conserver le même contenu et la même clé lors des retries.
- `subscriptionSentAt` et l’identifiant Resend sont enregistrés uniquement après acceptation de l’email par Resend. Ce statut signifie « envoyé au prestataire », pas une garantie d’absence de rebond.
- Un envoi en échec reste visible et peut être retenté. Les webhooks répétés ne revalident pas le paiement et n’envoient pas deux fois un abonnement déjà envoyé.
- Un verrou d’envoi de trois minutes et une clé Resend persistante protègent les requêtes concurrentes et la reprise après interruption.
- Après 23 heures depuis une première tentative ambiguë, le système refuse de renvoyer automatiquement : vérifiez l’envoi dans Resend avant une réparation manuelle, car sa rétention d’idempotence est de 24 heures. Ne remettez pas les champs d’envoi à zéro sans cette vérification.

Les paiements Stripe ne peuvent plus être marqués manuellement comme payés depuis l’administration. Le workflow de statut manuel pour le paiement à la livraison est conservé. Aucune information d’abonnement n’est envoyée par WhatsApp.

## Vérification

```powershell
npm.cmd run test:payments
npm.cmd run lint
npx.cmd tsc --noEmit --incremental false
npm.cmd run build
```

Les tests de paiement utilisent les vrais services TypeScript, le vrai SDK Stripe pour les signatures et des substituts pour Stripe réseau, Prisma et l’envoi email. Ils vérifient les montants, devises, métadonnées, doublons, annulations, accès non autorisés, retries email et le maintien de la création d’une commande à la livraison avec prix serveur. Ils ne créent pas de commande réelle.

Le contrôle des nouveaux fichiers de paiement et des services modifiés passe. Le lint global du dépôt présente encore des erreurs préexistantes, notamment `react-hooks/set-state-in-effect` dans les composants existants. Ces fichiers ne sont pas réécrits dans cette intégration.

Un test complet Stripe/Resend sur vos comptes reste nécessaire après configuration des clés. Vérifiez au minimum : paiement test réussi, refus de carte, annulation, rafraîchissement avant webhook, replay du même événement, double clic, absence de clés email, retry email et session de paiement expirée. N’utilisez des clés live qu’après ces tests.

## Fichiers créés ou modifiés pour cette intégration

Modifiés :

- `.env.example`
- `package.json`
- `package-lock.json`
- `prisma/schema.prisma`
- `src/lib/email.ts`
- `src/lib/store.ts`
- `src/lib/types.ts`
- `src/app/api/orders/route.ts`
- `src/app/api/payments/webhook/route.ts`
- `src/app/api/admin/orders/route.ts`
- `src/app/admin/orders/page.tsx`
- `src/app/commander/page.tsx`
- `src/app/commander/confirmation/page.tsx`

Créés :

- `prisma/migrations/20261003000100_online_payments/migration.sql`
- `src/lib/payments/access.ts`
- `src/lib/payments/checkout.ts`
- `src/lib/payments/stripe.ts`
- `src/lib/payments/validation.ts`
- `src/lib/payments/webhook.ts`
- `src/lib/payments/subscriptions.ts`
- `src/app/api/payments/checkout/route.ts`
- `src/app/api/payments/config/route.ts`
- `src/app/api/payments/status/route.ts`
- `src/app/api/admin/orders/subscription/route.ts`
- `src/app/payment/success/page.tsx`
- `src/app/payment/cancel/page.tsx`
- `src/components/PayOrderButton.tsx`
- `src/components/OrderPaymentPanel.tsx`
- `src/components/PaymentResult.tsx`
- `src/components/AdminSubscriptionPanel.tsx`
- `tests/payments.test.mjs`
- `docs/PAYMENTS.md`

Le client Prisma dans `src/generated/prisma` a été régénéré; il reste exclu de Git conformément à la configuration du projet. Les modifications de design et d’images déjà présentes avant cette demande sont conservées.
