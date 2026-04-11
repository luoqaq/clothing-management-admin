import type { SelectProps } from 'antd';

type TouchFriendlySelectProps = Pick<SelectProps, 'getPopupContainer' | 'popupClassName' | 'virtual'>;

export const touchFriendlySelectProps: TouchFriendlySelectProps = {
  virtual: false,
  popupClassName: 'touch-select-dropdown',
  getPopupContainer: (triggerNode) => triggerNode.parentElement ?? document.body,
};
