export const SHARED_COLUMNS = ['name', 'description'];

export const ENTRY_TYPES = {
  spells: {
    table: 'spells', label: 'Spell',
    category: { kind: 'spell_school', column: 'school_id', other: 'school_other', table: 'spell_schools' },
    columns: ['level', 'school_id', 'school_other', 'casting_time', 'range_text', 'verbal', 'somatic',
              'material', 'duration', 'concentration', 'ritual', 'higher_levels'],
  },
  items: {
    table: 'items', label: 'Item',
    category: { kind: 'item_type', column: 'item_type_id', other: 'item_type_other', table: 'item_types' },
    columns: ['item_type_id', 'item_type_other', 'rarity', 'requires_attunement', 'attunement_note',
              'weight_lb', 'cost_gp'],
  },
  monsters: {
    table: 'monsters', label: 'Monster',
    category: { kind: 'creature_type', column: 'creature_type_id', other: 'creature_type_other', table: 'creature_types' },
    columns: ['size', 'creature_type_id', 'creature_type_other', 'alignment', 'armor_class', 'hit_points',
              'hit_dice', 'speed', 'str_score', 'dex_score', 'con_score', 'int_score', 'wis_score',
              'cha_score', 'challenge_rating', 'traits', 'actions'],
  },
  classes: {
    table: 'character_classes', label: 'Class', category: null,
    columns: ['hit_die', 'primary_ability', 'saving_throws', 'armor_proficiencies',
              'weapon_proficiencies', 'skill_choices', 'spellcasting_ability', 'features'],
  },
  races: {
    table: 'character_races', label: 'Race', category: null,
    columns: ['size', 'speed', 'ability_bonuses', 'darkvision', 'languages', 'traits'],
  },
};

export function getEntryType(slug) {
  return Object.hasOwn(ENTRY_TYPES, slug) ? ENTRY_TYPES[slug] : null;
}