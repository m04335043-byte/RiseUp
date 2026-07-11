import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './src/config/firebase';
import { doc, getDoc } from 'firebase/firestore';

// Screens
import AuthScreen from './src/screens/AuthScreen';
import WelcomeScreen from './src/screens/WelcomeScreen';
import GoalSetupScreen from './src/screens/GoalSetupScreen';
import HomeScreen from './src/screens/HomeScreen';
import AICoachScreen from './src/screens/AICoachScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function HomeTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#2563eb',
        tabBarInactiveTintColor: '#9ca3af',
        tabBarStyle: {
          borderTopWidth: 1,
          borderTopColor: '#e5e7eb',
          backgroundColor: '#fff',
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🏠</Text>,
        }}
      />
      <Tab.Screen
        name="AICoach"
        component={AICoachScreen}
        options={{
          tabBarLabel: 'Coach',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>🤖</Text>,
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Dashboard',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>📊</Text>,
        }}
      />
      <Tab.Screen
        name="Profile"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ fontSize: 20, color }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasCompletedWelcome, setHasCompletedWelcome] = useState(false);
  const [hasCompletedGoalSetup, setHasCompletedGoalSetup] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        // Check if user has completed welcome and goal setup
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          setHasCompletedWelcome(true);
          setHasCompletedGoalSetup(!!userSnap.data().primaryGoal);
        }
      } else {
        setUser(null);
        setHasCompletedWelcome(false);
        setHasCompletedGoalSetup(false);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return null;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen
            name="Auth"
            options={{ animationEnabled: false }}
          >
            {(props) => (
              <AuthScreen
                {...props}
                onAuthSuccess={(user) => {
                  setUser(user);
                  setHasCompletedWelcome(false);
                }}
              />
            )}
          </Stack.Screen>
        ) : !hasCompletedWelcome ? (
          <Stack.Screen
            name="Welcome"
            options={{ animationEnabled: false }}
          >
            {(props) => (
              <WelcomeScreen
                {...props}
                userName={user.displayName || 'Friend'}
                onContinue={() => setHasCompletedWelcome(true)}
              />
            )}
          </Stack.Screen>
        ) : !hasCompletedGoalSetup ? (
          <Stack.Screen
            name="GoalSetup"
            options={{ animationEnabled: false }}
          >
            {(props) => (
              <GoalSetupScreen
                {...props}
                onComplete={() => setHasCompletedGoalSetup(true)}
              />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen
            name="MainApp"
            component={HomeTabs}
            options={{ animationEnabled: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
