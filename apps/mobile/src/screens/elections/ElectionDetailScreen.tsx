import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useRoute, type RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import type { RootStackParamList } from '../../types/navigation';
import {
  ELECTIONS,
  ELECTION_DETAILS,
  CATEGORY_META,
  type Candidate,
  type Election,
  type KeyDate,
} from './data';

export default function ElectionDetailScreen() {
  const route = useRoute<RouteProp<RootStackParamList, 'ElectionDetail'>>();
  const { electionId } = route.params;

  const election = ELECTIONS.find(e => e.id === electionId);
  const detail   = ELECTION_DETAILS[electionId];

  if (!election) {
    return (
      <View style={s.notFound}>
        <Text style={s.notFoundText}>Election not found.</Text>
      </View>
    );
  }

  const cat = CATEGORY_META[election.category];
  const confirmed   = detail?.candidates.filter(c => c.status === 'confirmed') ?? [];
  const provisional = detail?.candidates.filter(c => c.status === 'provisional') ?? [];
  const withdrawn   = detail?.candidates.filter(c => c.status === 'withdrawn')   ?? [];

  return (
    <ScrollView style={s.root} contentContainerStyle={s.content}>
      <Hero election={election} categoryLabel={cat.label} />

      {detail?.speculative && (
        <View style={s.advisory}>
          <Ionicons name="information-circle-outline" size={14} color={colors.text2} />
          <Text style={s.advisoryText}>
            Dates and candidates below are <Text style={s.advisoryEm}>speculative</Text> — placeholder
            data until the electoral commission publishes confirmed information.
          </Text>
        </View>
      )}

      {detail && (
        <Section title="KEY DATES">
          {detail.keyDates.map(d => (
            <KeyDateRow key={d.label} item={d} />
          ))}
        </Section>
      )}

      {detail && (
        <Section title={`CANDIDATES · ${detail.candidates.length}`}>
          {confirmed.length > 0 && (
            <SubSection label="CONFIRMED">
              {confirmed.map(c => <CandidateRow key={c.name} c={c} />)}
            </SubSection>
          )}
          {provisional.length > 0 && (
            <SubSection label="PROVISIONAL">
              {provisional.map(c => <CandidateRow key={c.name} c={c} />)}
            </SubSection>
          )}
          {withdrawn.length > 0 && (
            <SubSection label="WITHDRAWN / INELIGIBLE">
              {withdrawn.map(c => <CandidateRow key={c.name} c={c} />)}
            </SubSection>
          )}
        </Section>
      )}

      {!detail && (
        <View style={s.empty}>
          <Text style={s.emptyText}>No additional detail recorded for this election yet.</Text>
        </View>
      )}
    </ScrollView>
  );
}

function Hero({
  election,
  categoryLabel,
}: {
  election: Election;
  categoryLabel: string;
}) {
  return (
    <View style={s.hero}>
      <View style={s.heroTop}>
        <Text style={s.heroFlag}>{election.flag}</Text>
        <Text style={s.heroCat}>{categoryLabel}</Text>
      </View>
      <Text style={s.heroCountry}>{election.country}</Text>
      <Text style={s.heroType}>{election.type}</Text>
      <View style={s.heroMeta}>
        <Ionicons name="calendar-outline" size={14} color={colors.text2} />
        <Text style={s.heroMetaText}>{election.date}</Text>
        <View style={s.heroMetaSep} />
        <Ionicons name="time-outline" size={14} color={colors.text2} />
        <Text style={s.heroMetaText}>{election.lead}</Text>
      </View>
    </View>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={s.section}>
      <Text style={s.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function SubSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={s.subSection}>
      <Text style={s.subSectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function KeyDateRow({ item }: { item: KeyDate }) {
  const tint =
    item.status === 'past' ? colors.text3 :
    item.status === 'upcoming' ? colors.yellow :
    colors.text2;
  const icon =
    item.status === 'past'     ? 'checkmark-circle' :
    item.status === 'upcoming' ? 'ellipse'          :
    'ellipse-outline';
  return (
    <View style={s.kdRow}>
      <Ionicons name={icon} size={14} color={tint} />
      <Text style={s.kdLabel}>{item.label}</Text>
      <View style={s.kdSpacer} />
      <Text style={[s.kdDate, { color: tint }]}>{item.date}</Text>
    </View>
  );
}

function CandidateRow({ c }: { c: Candidate }) {
  return (
    <View style={s.candidate}>
      <View style={s.candidateMain}>
        <Text style={s.candidateName}>{c.name}</Text>
        <View style={s.candidatePartyRow}>
          <Text style={s.candidateParty}>{c.party}</Text>
          {c.partyFull && c.partyFull !== c.party && (
            <Text style={s.candidatePartyFull} numberOfLines={1}>
              {' · '}{c.partyFull}
            </Text>
          )}
        </View>
        {c.note && <Text style={s.candidateNote}>{c.note}</Text>}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: 32 },

  hero: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 20,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.borderHi,
  },
  heroTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  heroFlag:  { fontSize: 36 },
  heroCat: {
    color: colors.text2,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1.5,
    paddingTop: 8,
  },
  heroCountry: { color: colors.text, fontSize: 22, fontWeight: '700', marginBottom: 4 },
  heroType:    { color: colors.text2, fontSize: 13, lineHeight: 18 },
  heroMeta:    {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    gap: 6,
  },
  heroMetaText: { color: colors.text2, fontSize: 12, fontFamily: 'monospace' },
  heroMetaSep:  { width: 1, height: 12, backgroundColor: colors.border, marginHorizontal: 6 },

  advisory: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginHorizontal: 16,
    marginTop: 12,
    padding: 12,
    backgroundColor: 'rgba(96,165,250,0.06)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(96,165,250,0.2)',
    gap: 8,
  },
  advisoryText: { color: colors.text2, fontSize: 12, lineHeight: 18, flex: 1 },
  advisoryEm:   { color: colors.text, fontWeight: '700' },

  section: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionTitle: {
    color: colors.text2,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 14,
  },

  subSection: { marginBottom: 16 },
  subSectionLabel: {
    color: colors.text3,
    fontSize: 9,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },

  kdRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    gap: 10,
  },
  kdLabel:   { color: colors.text, fontSize: 13 },
  kdSpacer:  { flex: 1 },
  kdDate:    { fontSize: 12, fontFamily: 'monospace' },

  candidate: {
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  candidateMain: { flex: 1 },
  candidateName: { color: colors.text, fontSize: 14, fontWeight: '700' },
  candidatePartyRow: { flexDirection: 'row', alignItems: 'baseline', marginTop: 2 },
  candidateParty: {
    color: colors.yellow,
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  candidatePartyFull: {
    color: colors.text3,
    fontSize: 11,
    fontFamily: 'monospace',
    flex: 1,
  },
  candidateNote: {
    color: colors.text2,
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },

  empty: {
    marginHorizontal: 16,
    marginTop: 12,
    padding: 24,
    backgroundColor: colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  emptyText: { color: colors.text3, fontSize: 13 },

  notFound: {
    flex: 1,
    backgroundColor: colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: { color: colors.text3, fontSize: 14 },
});
