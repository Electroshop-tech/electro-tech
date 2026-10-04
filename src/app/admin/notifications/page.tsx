import OrderNotifications from "@/components/admin/OrderNotifications";
import PhoneAlertSettings from "@/components/admin/PhoneAlertSettings";
import PushAlertSettings from "@/components/admin/PushAlertSettings";

export default function NotificationsPage() {
  return <div className="max-w-6xl space-y-6"><div><h1 className="text-2xl font-bold text-slate-900">Notifications</h1><p className="text-sm text-slate-500 mt-2">Une nouvelle commande, un paiement confirmé : sachez quand agir.</p></div><div className="grid xl:grid-cols-[minmax(0,1fr)_360px] gap-6 items-start"><OrderNotifications /><div className="space-y-6"><PushAlertSettings /><PhoneAlertSettings /></div></div></div>;
}
