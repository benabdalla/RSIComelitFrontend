import {INavData} from '@coreui/angular';

const commonNavItems: INavData[] = [

  {
    name: 'Posts',
    url: '/user/list-post',
    iconComponent: {name: 'cil-cursor'},
    badge: {
      color: 'danger',
      text: 'NEW',
    },
  },
  {
    name: 'RSI Comelit',
    title: true,
  },
  {
    name: 'Profile',
    url: '/user/edit-profile',
    iconComponent: {name: 'cil-puzzle'},
  },
  {
    name: 'New Post',
    url: '/user/add-post',
    iconComponent: {name: 'cil-cursor'},
  },
  {
    name: 'Timeline',
    url: '/user/timeline',
    iconComponent: {name: 'view_timeline'},
    badge: {
      color: 'success',
      text: 'HOT',
    },
  },
  {
    name: 'Conges',
    url: '/user/conges',
    iconComponent: {name: 'view_conges'},
    badge: {
      color: 'success',
      text: 'HOT',
    },
  },
  {
    name: 'Chat',
    url: '/user/chat',
    linkProps: {fragment: 'headings'},
    iconComponent: {name: 'cil-pencil'},
  },
    {
    name: 'Absences',
    url: '/user/absences-notifications',
    linkProps: {fragment: 'headings'},
    iconComponent: {name: 'cil-pencil'},
  },

];

export const navItemsAdmin: INavData[] = [
  ...commonNavItems.slice(0, 1),
  {
    title: true,
    name: 'Mangement USERS',
  },
  {
    name: 'Create Employee',
    url: '/user/add-user',
    iconComponent: {name: 'cil-drop'},
  },
  {
    name: 'Liste of Employees',
    url: '/user/user-list',
    linkProps: {fragment: 'headings'},
    iconComponent: {name: 'cil-pencil'},
  },
  ...commonNavItems.slice(1),
];

export const navItemsUser: INavData[] = [
  ...commonNavItems
];
