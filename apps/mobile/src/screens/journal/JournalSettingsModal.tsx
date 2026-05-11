import { useEffect, useMemo, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../theme/colors';
import { COUNTRIES, type Country, type State } from './data';

type Props = {
  visible: boolean;
  /** Selected ids — country ids and/or state ids. */
  followed: Set<string>;
  onClose: () => void;
  onSave: (next: Set<string>) => void;
};

export default function JournalSettingsModal({ visible, followed, onClose, onSave }: Props) {
  const [draft, setDraft] = useState<Set<string>>(followed);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [query, setQuery] = useState('');

  // Reset draft + expansion when modal re-opens.
  useEffect(() => {
    if (visible) {
      setDraft(new Set(followed));
      setExpanded(new Set());
      setQuery('');
    }
  }, [visible, followed]);

  const filtered = useMemo<Country[]>(() => {
    const q = query.trim().toLowerCase();
    if (!q) return COUNTRIES;
    return COUNTRIES.filter(c =>
      c.name.toLowerCase().includes(q) ||
      c.states.some(st => st.name.toLowerCase().includes(q)),
    );
  }, [query]);

  function toggle(id: string) {
    setDraft(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleExpand(id: string) {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function clearAll() {
    setDraft(new Set());
  }

  function save() {
    onSave(draft);
    onClose();
  }

  const followedTotal = draft.size;

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <SafeAreaView style={s.root} edges={['top', 'bottom']}>
        <View style={s.header}>
          <View style={s.headerTopRow}>
            <Text style={s.title}>Follow countries</Text>
            <Pressable
              onPress={onClose}
              style={({ pressed }) => [s.iconBtn, pressed && s.pressed]}
              hitSlop={10}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>
          <Text style={s.sub}>
            Pick a country to follow all of its government proceedings, or expand it to follow
            specific regions.
          </Text>
        </View>

        <View style={s.searchWrap}>
          <Ionicons name="search" size={16} color={colors.text3} style={s.searchIcon} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search countries or regions"
            placeholderTextColor={colors.text3}
            style={s.search}
            autoCorrect={false}
            autoCapitalize="none"
            returnKeyType="search"
          />
          {query.length > 0 && (
            <Pressable onPress={() => setQuery('')} hitSlop={8} style={s.clearBtn}>
              <Ionicons name="close-circle" size={16} color={colors.text3} />
            </Pressable>
          )}
        </View>

        <ScrollView
          style={s.list}
          contentContainerStyle={s.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filtered.length === 0 ? (
            <View style={s.empty}>
              <Text style={s.emptyText}>No matches for &quot;{query}&quot;.</Text>
            </View>
          ) : (
            filtered.map(c => {
              const hasStates    = c.states.length > 0;
              const isCountryOn  = draft.has(c.id);
              const stateOnCount = c.states.filter(st => draft.has(st.id)).length;
              const isExpanded   = expanded.has(c.id);
              return (
                <View key={c.id} style={s.countryCard}>
                  <CountryHeader
                    country={c}
                    hasStates={hasStates}
                    countryOn={isCountryOn}
                    stateOnCount={stateOnCount}
                    expanded={isExpanded}
                    onToggleCountry={() => toggle(c.id)}
                    onToggleExpand={hasStates ? () => toggleExpand(c.id) : () => toggle(c.id)}
                  />
                  {hasStates && isExpanded && (
                    <View style={s.stateList}>
                      {c.states.map(st => (
                        <StateRow
                          key={st.id}
                          state={st}
                          selected={draft.has(st.id)}
                          disabled={isCountryOn}
                          onToggle={() => toggle(st.id)}
                        />
                      ))}
                    </View>
                  )}
                </View>
              );
            })
          )}
        </ScrollView>

        <View style={s.footer}>
          <View style={s.footerLeft}>
            <Text style={s.footerCount}>
              {followedTotal === 0
                ? 'Nothing followed'
                : `${followedTotal} ${followedTotal === 1 ? 'place' : 'places'} followed`}
            </Text>
            {followedTotal > 0 && (
              <Pressable onPress={clearAll} hitSlop={6}>
                <Text style={s.clearAll}>Clear all</Text>
              </Pressable>
            )}
          </View>
          <Pressable
            onPress={save}
            style={({ pressed }) => [s.saveBtn, pressed && s.saveBtnPressed]}
          >
            <Text style={s.saveBtnText}>Done</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

function CountryHeader({
  country,
  hasStates,
  countryOn,
  stateOnCount,
  expanded,
  onToggleCountry,
  onToggleExpand,
}: {
  country: Country;
  hasStates: boolean;
  countryOn: boolean;
  stateOnCount: number;
  expanded: boolean;
  onToggleCountry: () => void;
  onToggleExpand: () => void;
}) {
  const sub = countryOn
    ? hasStates
      ? `Following · all ${country.regionLabel}`
      : 'Following'
    : stateOnCount > 0
    ? `Following · ${stateOnCount} ${stateOnCount === 1 ? country.regionLabel.replace(/s$/, '') : country.regionLabel}`
    : country.hostOrg
    ? `Hosted by ${country.hostOrg}`
    : 'No partner yet';

  return (
    <View style={s.row}>
      <Pressable
        onPress={onToggleExpand}
        style={({ pressed }) => [s.rowBody, pressed && s.pressed]}
        accessibilityRole={hasStates ? 'button' : 'checkbox'}
        accessibilityLabel={
          hasStates
            ? `${expanded ? 'Collapse' : 'Expand'} ${country.name}`
            : `Follow ${country.name}`
        }
      >
        <Text style={s.flag}>{country.flag}</Text>
        <View style={s.rowText}>
          <Text style={s.rowName}>{country.name}</Text>
          <Text style={s.rowSub} numberOfLines={1}>{sub}</Text>
        </View>
        {hasStates && (
          <Ionicons
            name={expanded ? 'chevron-up' : 'chevron-down'}
            size={16}
            color={colors.text3}
          />
        )}
      </Pressable>
      <Pressable
        onPress={onToggleCountry}
        style={({ pressed }) => [s.checkHit, pressed && s.pressed]}
        hitSlop={6}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: countryOn }}
        accessibilityLabel={
          hasStates ? `Follow all ${country.regionLabel} of ${country.name}` : `Follow ${country.name}`
        }
      >
        <View style={[s.check, countryOn && s.checkOn]}>
          {countryOn && <Ionicons name="checkmark" size={16} color="#0a0700" />}
        </View>
      </Pressable>
    </View>
  );
}

function StateRow({
  state,
  selected,
  disabled,
  onToggle,
}: {
  state: State;
  selected: boolean;
  disabled: boolean;
  onToggle: () => void;
}) {
  const effective = disabled || selected;
  return (
    <Pressable
      onPress={disabled ? undefined : onToggle}
      style={({ pressed }) => [s.stateRow, pressed && !disabled && s.pressed]}
      accessibilityRole="checkbox"
      accessibilityState={{ checked: effective, disabled }}
    >
      <Text style={[s.stateName, disabled && s.stateNameDisabled]}>{state.name}</Text>
      <View style={[s.checkSm, effective && s.checkSmOn, disabled && !selected && s.checkSmImplied]}>
        {effective && <Ionicons name="checkmark" size={12} color={disabled ? colors.text3 : '#0a0700'} />}
      </View>
    </Pressable>
  );
}

const s = StyleSheet.create({
  root:    { flex: 1, backgroundColor: colors.bg },

  header:  { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 10 },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title:   { color: colors.text, fontSize: 20, fontWeight: '700' },
  sub:     { color: colors.text2, fontSize: 13, lineHeight: 19, marginTop: 4 },
  iconBtn: { padding: 4 },

  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    marginTop: 8,
    marginBottom: 8,
    paddingHorizontal: 12,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: { marginRight: 8 },
  search: {
    flex: 1,
    color: colors.text,
    fontSize: 14,
    paddingVertical: 10,
  },
  clearBtn: { padding: 4 },

  list:        { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 4, paddingBottom: 16 },

  countryCard: {
    marginBottom: 8,
    backgroundColor: colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rowBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    gap: 4,
  },
  pressed: { opacity: 0.6 },
  flag:    { fontSize: 24, marginRight: 12 },
  rowText: { flex: 1 },
  rowName: { color: colors.text, fontSize: 15, fontWeight: '700' },
  rowSub:  { color: colors.text2, fontSize: 11, fontFamily: 'monospace', marginTop: 2 },

  checkHit: { paddingHorizontal: 14, paddingVertical: 14 },
  check: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkOn: {
    borderColor: colors.yellow,
    backgroundColor: colors.yellow,
  },

  stateList: {
    paddingBottom: 6,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  stateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    paddingLeft: 50,
  },
  stateName: {
    flex: 1,
    color: colors.text,
    fontSize: 13,
  },
  stateNameDisabled: { color: colors.text3 },
  checkSm: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
  },
  checkSmOn: {
    borderColor: colors.yellow,
    backgroundColor: colors.yellow,
  },
  checkSmImplied: {
    borderColor: colors.text3,
    backgroundColor: 'transparent',
  },

  empty:     { padding: 32, alignItems: 'center' },
  emptyText: { color: colors.text3, fontSize: 13 },

  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerLeft: { flex: 1 },
  footerCount: {
    color: colors.text2,
    fontSize: 12,
    fontFamily: 'monospace',
  },
  clearAll: {
    color: colors.yellow,
    fontSize: 11,
    fontFamily: 'monospace',
    marginTop: 2,
  },
  saveBtn: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    backgroundColor: colors.yellow,
    borderRadius: 8,
  },
  saveBtnPressed: { opacity: 0.7 },
  saveBtnText: {
    color: '#0a0700',
    fontWeight: '700',
    fontSize: 14,
    fontFamily: 'monospace',
  },
});
