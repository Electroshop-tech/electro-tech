# Notifications de commandes

## Confirmation client et reprise des emails

Le checkout demande maintenant un email valide pour chaque commande. Les commandes invitées créent automatiquement le compte technique nécessaire à leur sauvegarde. Le stock, la commande, la notification admin et les deux tâches email sont enregistrés dans une transaction : une rupture de stock annule toute la sauvegarde.

La confirmation client et l’email administrateur sont conservés dans `OrderEmailDelivery`. Ils partent via `after()` après la réponse du checkout. L’email client inclut la référence de commande et un lien de suivi utilisable sans compte. L’email administrateur contient le téléphone et un lien vers la commande ouverte. **Notifications** affiche le statut de chaque email et propose **Relancer l’email** aux responsables pour les envois en échec. Lire ou manquer une notification ne supprime jamais la commande ni les coordonnées du client.

Pour les envois réels, configurez côté serveur `RESEND_API_KEY`, `RESEND_FROM` avec un domaine vérifié, `NEXT_PUBLIC_SITE_URL` et `JWT_SECRET`. Vérifiez le destinataire dans **Paramètres → Email du site** (`siteEmail`), et activez les emails de nouvelles commandes (`newOrderEmail`). Ne transmettez pas les clés privées dans le navigateur.

Le cron décrit ci-dessous reprend également les emails en attente. Configurez son appel authentifié toutes les minutes pour une reprise même lorsque l’administration est fermée. Les emails en échec de configuration restent visibles et peuvent être relancés après correction. Le contenu et le destinataire du premier envoi sont conservés ; les reprises utilisent la même clé d’idempotence. [Resend conserve ces clés pendant 24 heures](https://resend.com/changelog/idempotency-keys) ; les reprises automatiques s’arrêtent après 23 heures pour éviter un nouvel envoi incertain. Le statut **Accepté par le service email** confirme l’acceptation fournisseur, pas la réception dans la boîte du client.

Validation locale : `npm run test:orders`, `npm run test:notifications`, `npm run test:payments`. `node tests/live-order-check.mjs` vérifie manuellement la sauvegarde réelle et les API admin sur un serveur local au port 3100, uniquement sans prestataires sortants configurés. Il conserve une commande clairement marquée TEST, l’annule, restaure le stock et désactive ses alertes.

Les nouvelles commandes créent une notification dans la même écriture Prisma que la commande. Elle apparaît dans la cloche de l’administration et dans **Ventes → Notifications**, avec le client, le numéro, le montant et un lien direct vers la commande ouverte. Le tableau de bord se rafraîchit toutes les 20 secondes lorsqu’il est visible et affiche une alerte visuelle pour un nouvel événement. Les notifications sont partagées entre les administrateurs, y compris leur état lu/non lu.

Une commande Stripe non payée affiche **En attente de paiement — ne pas expédier**. Le webhook vérifié crée une seconde notification **Paiement confirmé** lors du premier passage à `PAID`. Les événements Stripe répétés ne créent pas de doublons. Lire une notification ne change jamais le paiement ni le statut logistique. Les commandes existantes ne sont pas réannoncées rétroactivement.

## Alertes sur le téléphone

Dans **Paramètres → Alertes sur votre téléphone**, ou **Ventes → Notifications**, le propriétaire ou un responsable peut sélectionner SMS ou WhatsApp, enregistrer son numéro au format international et activer les alertes. Ce réglage est commun à la boutique : un seul numéro destinataire. Les employés peuvent consulter les alertes du tableau de bord mais ne peuvent pas modifier ni relancer les messages téléphoniques.

Les messages sont désactivés par défaut. Aucune clé Twilio n’est configurée automatiquement. Aucune activation ni message réel n’a été envoyé pendant l’implémentation. Les tarifs, le sender autorisé et les destinations disponibles dépendent du compte Twilio.

Variables privées côté serveur :

```dotenv
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
JWT_SECRET=une-cle-privee-aleatoire-au-moins-32-caracteres
# Numéro Twilio autorisé à envoyer des SMS
TWILIO_SMS_FROM=+...
# Pour WhatsApp uniquement : sender enregistré et modèle approuvé
TWILIO_WHATSAPP_FROM=whatsapp:+...
TWILIO_WHATSAPP_CONTENT_SID=HX...
NEXT_PUBLIC_SITE_URL=https://votre-domaine.com
ADMIN_NOTIFICATIONS_CRON_SECRET=une-cle-privee-longue-et-aleatoire
```

WhatsApp utilise un modèle approuvé contenant quatre variables : `{{1}}` numéro de commande, `{{2}}` montant et devise, `{{3}}` statut/action, `{{4}}` lien vers la commande. Exemple de texte à soumettre à Twilio : « ElectroShop-Tech : commande {{1}}, {{2}}. {{3}}. Consultez la commande : {{4}} ». L’administrateur doit accepter de recevoir ces messages sur son numéro. L’application utilise un template pour les messages initiés par la boutique. Références officielles : [API Messages Twilio](https://www.twilio.com/docs/messaging/api/message-resource), [envoi de modèles de contenu](https://www.twilio.com/docs/content/send-templates-created-with-the-content-template-builder).

Le message contient le numéro de commande, le montant, le statut et un lien protégé par la connexion admin. Il n’envoie pas les identifiants d’abonnement, l’adresse ou l’email du client. Il part après la réponse de création de commande via `after()` de Next.js. Une panne de messagerie ne fait pas échouer la commande ni le paiement.

## Fiabilité et reprise

Les envois sont enregistrés dans `AdminOrderNotification`. Un changement atomique `PENDING → SENDING` évite les doubles envois par des workers concurrents. Une réponse positive avec un SID Twilio est marquée **Accepté par Twilio** : cela ne prouve pas une livraison au téléphone. Consultez le statut réel dans les journaux Twilio.

Un refus HTTP 4xx peut être relancé manuellement après correction dans Notifications. Les timeouts, réponses 5xx et interruptions restent **À vérifier** ; l’application ne les renvoie pas automatiquement car le fournisseur peut déjà avoir accepté le message. Vérifiez Twilio avant tout nouvel envoi. Un succès fournisseur suivi d’une panne de base reste également incertain et ne provoque pas d’envoi automatique en double.

Configurez votre ordonnanceur pour appeler toutes les minutes :

```http
GET https://votre-domaine.com/api/cron/admin-notifications
Authorization: Bearer <ADMIN_NOTIFICATIONS_CRON_SECRET>
```

Chaque appel traite jusqu’à trois messages en attente et marque comme incertains les envois interrompus depuis cinq minutes. Cette reprise nécessite un ordonnanceur externe ; aucun cron d’hébergement n’a été activé automatiquement. Les messages des nouvelles commandes sont déjà tentés immédiatement après la réponse. Une désactivation ou un changement de destinataire annule les messages encore en attente pour l’ancien réglage. L’activation ultérieure n’envoie pas les anciennes commandes.

## Migration et vérification

Migration additive appliquée à la base configurée : `prisma/migrations/20261003000200_admin_order_notifications/migration.sql`.

```powershell
npx.cmd prisma migrate deploy
npx.cmd prisma generate
npm.cmd run test:notifications
npm.cmd run test:payments
```

Les tests utilisent des entrées et fournisseurs simulés, sans créer de commande réelle ni envoyer de SMS/WhatsApp. Après configuration, créez une commande de test et vérifiez l’alerte, le lien, le statut de paiement et les journaux du fournisseur. Les notifications du tableau de bord fonctionnent sans Twilio.
