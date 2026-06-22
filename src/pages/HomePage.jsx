import TechnologyCard from "../components/TechnologyCard";

function HomePage() {
  return (
    <div className="text-center min-h-[80vh] py-12 px-4 bg-slate-800 rounded-xl shadow-2xl">
      <h1 className="text-4xl md:text-5xl font-extrabold text-sky-400 mb-6">
        Welcome to UserVault!
      </h1>
      <p className="text-lg md:text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
        This platform allows you to efficiently manage user information. You can
        securely add new users, view comprehensive details of all registered
        users, edit existing entries, and delete records as needed.
      </p>
      <div className="mt-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-sky-500 mb-6">
          Technologies Powering This Platform:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <TechnologyCard
            name="React.js"
            description="A fast and modern JavaScript library for building user interfaces and better experience."
            logoSrc="/react.svg"
            logoAlt="React Logo"
          />
          <TechnologyCard
            name="Express.js "
            description="A minimal and flexible Node.js web application framework used for the backend server to handle requests and data."
            logoSrc="/express.png"
            logoAlt="Express.js Logo"
          />
          <TechnologyCard
            name="MongoDB "
            description="A NoSQL document database used for storing user data in a flexible, JSON-like format."
            logoSrc="/mongoDB.png"
            logoAlt="MongoDB Logo"
          />
        </div>
      </div>
      <div className="mt-10">
        <h2 className="text-2xl md:text-3xl font-semibold text-sky-500 mb-6">
          Get Started:
        </h2>
        <p className="text-lg md:text-xl text-slate-300 mb-4">
          To view registered users, click on "View Users" in the navigation bar.
        </p>
        <p className="text-lg md:text-xl text-slate-300 mb-4">
          To add a new user, click on "Add User" in the navigation bar.
        </p>
        <p className="text-lg md:text-xl text-slate-300">
          You can also download user data as a PDF by clicking the download icon
          in the navigation bar.
        </p>
      </div>
    </div>
  );
}
export default HomePage;
