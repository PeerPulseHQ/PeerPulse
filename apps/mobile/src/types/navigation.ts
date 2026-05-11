export type RootStackParamList = {
  Tabs: undefined;
  Playground: undefined;
  DeveloperPlayground: undefined;
  ElectionDetail: { electionId: string };
  JournalDetail: { packetId: string };
};

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
