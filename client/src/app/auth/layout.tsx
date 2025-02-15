const layout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return <div className="card-centered">{children}</div>;
};

export default layout;
