import { Header } from "@/components/layout/Header.tsx";

export const Landing = () => {
  return (
      <div className="bg-background-dark h-screen">
          <Header />
          <div className="mx-auto mt-10 text-success-400">
              <h1 className="ml-20 mb-5 text-4xl font-bold">Welcome to LoomPay</h1>
              <div className="flex justify-center gap-5">
                  <img
                      height={600}
                      width={900}
                      className="rounded-xl"
                      src="/images/landing.png"
                      alt=""
                  />
          <div className="text-success-400 min-w-[700px] p-4 text-xl">
              <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Enhancing Your Payment Experience</h2>
                  <ul className="list-disc list-inside text-left mx-auto" style={{ maxWidth: '500px' }}>
                      <li>Versatile Invoicing for Web3</li>
                      <li>Enhanced Security and Accessibility</li>
                      <li>Bridges Traditional and Crypto Payments</li>
                      <li>Accepts Any ERC20 Token</li>
                      <li>Simplifies Offramping Process</li>
                      <li>Automatic Conversion to Stablecoins</li>
                  </ul>
              </div>
              <section className="text-center my-12">
                  <h2 className="text-3xl font-bold mb-4">Powered by</h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {['safe', 'cowswap', 'web3auth', 'walletConnect', 'unlimit', 'web3inbox'].map((item) => (
                          <div key={item} className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700">
                              {item}
                          </div>
                      ))}
                  </div>
              </section>
          </div>
      </div>
    </div>
      </div>
  );
};
