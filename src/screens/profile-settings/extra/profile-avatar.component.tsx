import React from 'react';
import { StyleSheet, View, ViewProps, ImageBackground, Image } from 'react-native';
import { Avatar, AvatarProps, ButtonElement, ButtonProps } from '@ui-kitten/components';

export interface ProfileAvatarProps extends AvatarProps {
  editButton?: () => ButtonElement;
}

export const ProfileAvatar = (props: ProfileAvatarProps): React.ReactElement<ViewProps> => {
  const renderEditButtonElement = (): ButtonElement => {
    const buttonElement: React.ReactElement<ButtonProps> = props.editButton();

    return React.cloneElement(buttonElement, {
      style: [buttonElement.props.style, styles.editButton],
    });
  };

  const { style, editButton, ...restProps } = props;

  return (
    <View style={[style, styles.container]}>
      <Avatar
        {...restProps}
        // @ts-ignore
        ImageComponent={restProps.source?.uri ? ImageBackground : Image}
        style={[style, styles.avatar]}
      />
      {editButton && renderEditButtonElement()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignSelf: 'center',
  },
  avatar: {
    height: 124,
    alignSelf: 'center',
    aspectRatio: 1.0,
    tintColor: '#ccc',
  },
  editButton: {
    position: 'absolute',
    alignSelf: 'flex-end',
    bottom: 0,
  },
});
