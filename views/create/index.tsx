import { NETWORKS } from '@/constants';
import { encryptMnemonic, hashPassword } from '@/crypto/encryption';
import { AccountService } from '@/hooks/account.service';
import { useUserStore, useWalletStore } from '@/store';
import { useCacheStore } from '@/store/cacheStore';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPublicClient, http, PublicClient } from 'viem';
import { english, generateMnemonic, mnemonicToAccount } from 'viem/accounts';

const CreateWalletPage: React.FC = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showError, setShowError] = useState(false);

    const setUserCredentials = useUserStore((state) => state.onSetCredentials);
    const createWallet = useWalletStore((state) => state.onCreateWallet);
    const wallets = useWalletStore((state) => state.wallets);
    const initCache = useCacheStore((state) => state.onInitCache);

    const navigator = useNavigate();

    useEffect(() => {
        setShowError(false);
    }, [password, confirmPassword]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            setShowError(true);        
        } else {
            const mnemonic = generateMnemonic(english)
            const encryptedMnemonic = await encryptMnemonic(mnemonic, password)
            const passwordHash = hashPassword(password)

            const tempAccount = new AccountService(mnemonicToAccount(mnemonic), createPublicClient({
                chain: NETWORKS["testnet"],
                transport: http()
            }) as PublicClient)

            const sender = await tempAccount.getSender()

            setUserCredentials({
                password: passwordHash,
                encryptedMnemonic: encryptedMnemonic
            })
            createWallet({
                id: 0,
                name: `Wallet ${wallets.length + 1}`,
                address: sender,
            })
            initCache(password)

            navigator('/home')
        }
    };

    return (
        <div className='flex flex-col h-screen justify-center'>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                />
                <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-3 py-2 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:shadow-outline-blue focus:border-blue-300"
                />
                {showError && <p>Passwords do not match!</p>}
                <button 
                    type="submit" 
                    className="w-full px-6 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:shadow-outline-blue"
                >
                    Create Wallet
                </button>
            </form>  
        </div>
    )
};

export default CreateWalletPage;