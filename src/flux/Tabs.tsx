function Tab(props: any) {
    console.log("Tab Render", props);

    const id =
        typeof props.initNode.id === "function"
            ? props.initNode.id()
            : props.initNode.id;

    return (
        <div>
            <div>{id}</div>
        </div>
    );
}

export default Tab;
