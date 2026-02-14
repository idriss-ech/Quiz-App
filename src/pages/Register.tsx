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

const Register: React.FC = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const history = useHistory();

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Register attempt with:', { name, email, password, confirmPassword });
        history.push('/home');
    };

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding">
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                    <div className="ion-margin-bottom">
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginLeft: '10px' }}>Register</h1>
                    </div>

                    <form onSubmit={handleRegister}>
                        <IonList style={{ background: 'transparent', paddingTop: 0 }}>
                            <IonItem lines="full" style={{ '--background': 'transparent', marginBottom: '10px' }}>
                                <IonInput
                                    label="Full Name"
                                    labelPlacement="floating"
                                    placeholder="Enter your full name"
                                    type="text"
                                    value={name}
                                    onIonInput={e => setName(e.detail.value!)}
                                    required
                                />
                            </IonItem>
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
                            <IonItem lines="full" style={{ '--background': 'transparent', marginBottom: '10px' }}>
                                <IonInput
                                    label="Confirm Password"
                                    labelPlacement="floating"
                                    placeholder="Confirm your password"
                                    type="password"
                                    value={confirmPassword}
                                    onIonInput={e => setConfirmPassword(e.detail.value!)}
                                    required
                                />
                            </IonItem>
                        </IonList>

                        <div className="ion-padding-top ion-margin-top">
                            <IonButton expand="block" type="submit" size="large" className="ion-margin-bottom" color="primary">
                                Sign Up
                            </IonButton>
                            <IonButton expand="block" fill="clear" onClick={() => history.push('/login')} color="primary">
                                Already have an account? Sign In
                            </IonButton>
                        </div>
                    </form>
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Register;
