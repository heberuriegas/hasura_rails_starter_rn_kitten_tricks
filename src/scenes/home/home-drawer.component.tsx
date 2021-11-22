import React, { ReactElement, useState } from 'react';
import { StyleSheet, View, ImageBackground } from 'react-native';
import {
  Avatar,
  Divider,
  Drawer,
  DrawerItem,
  DrawerElement,
  Layout,
  Text,
  IndexPath,
  Button,
} from '@ui-kitten/components';
import { BookIcon, GithubIcon } from '../../components/icons';
import { SafeAreaLayout } from '../../components/safe-area-layout.component';
import { WebBrowserService } from '../../services/web-browser.service';
import { AppInfoService } from '../../services/app-info.service';
import { useAuth } from '../../hooks/use-auth';

const version: string = AppInfoService.getVersion();

export const HomeDrawer = ({ navigation }): DrawerElement => {
  const [selectedIndex, setSelectedIndex] = useState<IndexPath>(null);
  const { currentUser } = useAuth();

  const DATA = [
    {
      title: 'Libraries',
      icon: GithubIcon,
      onPress: () => {
        navigation.toggleDrawer();
        navigation.navigate('Libraries');
      },
    },
    {
      title: 'Documentation',
      icon: BookIcon,
      onPress: () => {
        WebBrowserService.openBrowserAsync('https://akveo.github.io/react-native-ui-kitten');
        navigation.toggleDrawer();
      },
    },
  ];

  const onPressEditProfile = () => {
    navigation.navigate('Profile Setting');
  };

  const renderHeader = (): ReactElement => (
    <SafeAreaLayout insets="top" level="2">
      <Layout style={styles.header} level="2">
        <View style={styles.profileContainer}>
          <Avatar
            style={styles.profileAvatar}
            source={
              currentUser?.avatar?.thumbnailUrl
                ? { uri: currentUser?.avatar?.thumbnailUrl }
                : require('../../assets/images/image-person.png')
            }
            ImageComponent={ImageBackground}
          />
          <Text style={styles.profileName} category="h6">
            Kitten Tricks
          </Text>
        </View>
        <View>
          <Button size="tiny" onPress={onPressEditProfile}>
            Edit profile
          </Button>
        </View>
      </Layout>
    </SafeAreaLayout>
  );

  const renderFooter = () => (
    <SafeAreaLayout insets="bottom">
      <React.Fragment>
        <Divider />
        <View style={styles.footer}>
          <Text>{`Version ${AppInfoService.getVersion()}`}</Text>
        </View>
      </React.Fragment>
    </SafeAreaLayout>
  );

  return (
    <Drawer
      header={renderHeader}
      footer={renderFooter}
      selectedIndex={selectedIndex}
      onSelect={index => setSelectedIndex(index)}
    >
      {DATA.map((el, index) => (
        <DrawerItem key={index} title={el.title} onPress={el.onPress} accessoryLeft={el.icon} />
      ))}
    </Drawer>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    height: 128,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginLeft: 16,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileName: {
    marginHorizontal: 16,
  },
  profileAvatar: {
    width: 70,
    height: 70,
    backgroundColor: '#fff',
    tintColor: '#ccc',
    marginBottom: 10,
  },
});
