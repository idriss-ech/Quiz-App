import React, { useState } from 'react';
import {
    IonContent,
    IonPage,
    IonInput,
    IonButton,
    IonItem,
    IonList,
    IonHeader,
    IonToolbar,
    IonTitle
} from '@ionic/react';
import { useHistory } from 'react-router-dom';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const history = useHistory();

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Login attempt with:', { email, password });
        history.push('/home');
    };

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding">
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <div className="ion-margin-bottom">
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginLeft: '10px' }}>Login</h1>
                    </div>

                    <form onSubmit={handleLogin}>
                        <IonList style={{ background: 'transparent', paddingTop: 0 }}>
                            <IonItem lines="full" style={{ '--background': 'transparent', marginBottom: '10px' }}>
                                <IonInput
                                    label="Email"
                                    labelPlacement="floating"
                                    placeholder="Enter your email"
                                    type="email"
                                    value={email}
                                    onIonInput={e => setEmail(e.detail.value!)}
                                    required
                                />
                            </IonItem>

                            <IonItem lines="full" style={{ '--background': 'transparent', marginBottom: '10px' }}>
                                <IonInput
                                    label="Password"
                                    labelPlacement="floating"
                                    placeholder="Enter your password"
                                    type="password"
                                    value={password}
                                    onIonInput={e => setPassword(e.detail.value!)}
                                    required
                                />
                            </IonItem>
                        </IonList>

                        <div className="ion-padding-top ion-margin-top">
                            <IonButton expand="block" type="submit" size="large" className="ion-margin-bottom" color="primary">
                                Sign In
                            </IonButton>
                            <IonButton expand="block" fill="clear" onClick={() => history.push('/register')} color="primary">
                                Create New Account
                            </IonButton>
                        </div>
                    </form>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Login;
