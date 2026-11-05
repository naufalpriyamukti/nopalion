export interface NotionColorItem {
  id: string;
  name: string;
  bgLight: string;
  bgDark: string;
  textLight: string;
  textDark: string;
  borderLight: string;
  borderDark: string;
}

export const NOTION_COLORS: NotionColorItem[] = [
  {
    id: 'default',
    name: 'Default',
    bgLight: '#FFFFFF',
    bgDark: '#202020',
    textLight: '#37352F',
    textDark: '#E6E6E5',
    borderLight: '#E9E9E7',
    borderDark: '#2E2E2E',
  },
  {
    id: 'gray',
    name: 'Gray',
    bgLight: '#F1F1EF',
    bgDark: '#2B2B2B',
    textLight: '#787774',
    textDark: '#9B9A97',
    borderLight: '#E3E2E0',
    borderDark: '#383838',
  },
  {
    id: 'brown',
    name: 'Brown',
    bgLight: '#F4EEEE',
    bgDark: '#382E2E',
    textLight: '#9F6B53',
    textDark: '#BA856F',
    borderLight: '#E8DEDD',
    borderDark: '#4A3B3B',
  },
  {
    id: 'orange',
    name: 'Orange',
    bgLight: '#FAEBDD',
    bgDark: '#43291B',
    textLight: '#D9730D',
    textDark: '#C77D48',
    borderLight: '#F5DCBE',
    borderDark: '#5E3821',
  },
  {
    id: 'yellow',
    name: 'Yellow',
    bgLight: '#FDF5D2',
    bgDark: '#443E1F',
    textLight: '#CB9000',
    textDark: '#CA9849',
    borderLight: '#F8E999',
    borderDark: '#5D5424',
  },
  {
    id: 'green',
    name: 'Green',
    bgLight: '#EDF3EC',
    bgDark: '#243729',
    textLight: '#448361',
    textDark: '#529E72',
    borderLight: '#D3E5D2',
    borderDark: '#2F4E37',
  },
  {
    id: 'blue',
    name: 'Blue',
    bgLight: '#E7F3F8',
    bgDark: '#1D3849',
    textLight: '#337EA9',
    textDark: '#5E87C9',
    borderLight: '#C3E1EE',
    borderDark: '#254E67',
  },
  {
    id: 'purple',
    name: 'Purple',
    bgLight: '#F4EEF8',
    bgDark: '#362446',
    textLight: '#9065B0',
    textDark: '#9D68D3',
    borderLight: '#E4D3EE',
    borderDark: '#4F3169',
  },
  {
    id: 'pink',
    name: 'Pink',
    bgLight: '#FBF0F4',
    bgDark: '#442436',
    textLight: '#C14C8A',
    textDark: '#D15796',
    borderLight: '#F5D7E5',
    borderDark: '#5E2F49',
  },
  {
    id: 'red',
    name: 'Red',
    bgLight: '#FDEBEC',
    bgDark: '#492928',
    textLight: '#D44C47',
    textDark: '#DF5452',
    borderLight: '#F9D0D2',
    borderDark: '#673735',
  },
];

export const STICKY_PALETTE = [
  { id: 'yellow', name: 'Yellow', bg: '#FDF7C3', border: '#EFE282', text: '#5A4A00' },
  { id: 'green', name: 'Mint', bg: '#DFF4E5', border: '#B8E5C3', text: '#1E562F' },
  { id: 'blue', name: 'Sky', bg: '#E0F0FE', border: '#BAE0FD', text: '#194973' },
  { id: 'pink', name: 'Peach', bg: '#FDE4EA', border: '#FABECB', text: '#6D2336' },
  { id: 'purple', name: 'Lavender', bg: '#F1E6FA', border: '#DEC5F6', text: '#4C246E' },
  { id: 'orange', name: 'Warm Orange', bg: '#FFEADB', border: '#FCD2B6', text: '#6B3A17' },
];
