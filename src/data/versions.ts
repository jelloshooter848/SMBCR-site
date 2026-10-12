/**
 * Short notes for the archived game versions on /versions/ (the builds themselves come from
 * tools/archive/build-versions.mjs). A version with no note here still shows, with a link to its
 * release notes. Only major and minor releases (vX.Y.0) are archived.
 */
export const VERSION_NOTES: Record<string, string> = {
  'v0.1.0':
    'The first release: all eight worlds of Super Mario Bros., eight heroes with their own kits, and the Lost Levels in level select. No world map or story yet.',
  'v0.2.0': 'Adds the Super Mario World-style world map, three save files and original map music.',
  'v0.3.0':
    'The touch controls revamp: buttons labelled with what they do, a d-pad that runs at its edge, and a floating stick option.',
  'v0.4.0': 'Adds the Warp Zone hub and the Lost Levels campaign, with 13 world maps of its own.',
};

export interface ArchivedVersion {
  tag: string;
  version: string;
  /** The release commit's date (ISO). */
  date: string;
}
