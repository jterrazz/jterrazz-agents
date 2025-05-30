export enum EventTypeEnum {
    RocketLaunch = 'rocket-launch',
    SpaceMission = 'space-mission',
}

export interface Event {
    date: Date;
    description?: string;
    eventType: EventTypeEnum;
    imageUrl?: string;
    location?: string;
    sourceUrl: string;
    title: string;
}
