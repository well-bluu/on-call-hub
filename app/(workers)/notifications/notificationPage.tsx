import {NotificationsPanel} from "./notificationPanel";
import NotificationBanner from "@/app/(workers)/notifications/notificationBanner";
import bannerImage from "@/components/assets/images/notification-banner.png";

export const instant = false;

export default async function NotificationPage() {
	return (
		<div className="mx-auto flex w-full max-w-4xl flex-col gap-4 p-0 sm:gap-6 sm:p-10">
			<NotificationBanner
				image={bannerImage}
				title={"Worker name"}
				description={"Worker Id"}
			/>
			<NotificationsPanel />
		</div>
	);
}
