use testcontainers::{
    core::{IntoContainerPort, WaitFor},
    runners::AsyncRunner,
    ContainerAsync, GenericImage, ImageExt,
};

/// Runs a Redis container for testing purposes.
/// Returns the host, port, and container instance.
/// # Arguments
/// * `port` - The port to expose Redis on.
/// # Returns
/// * `(String, u16, ContainerAsync<GenericImage>)` - A tuple containing the host, port, and container instance.
pub async fn run_redis_container(port: u16) -> (String, u16, ContainerAsync<GenericImage>) {
    let container = GenericImage::new("redis", "8.0.2-alpine")
        .with_exposed_port(port.tcp())
        .with_wait_for(WaitFor::message_on_stdout("Ready to accept connections"))
        .with_network("bridge")
        .with_env_var("DEBUG", "1")
        .start()
        .await
        .expect("Failed to start Redis");

    return (
        container.get_host().await.unwrap().to_string().clone(),
        container.get_host_port_ipv4(port).await.unwrap(),
        container,
    );
}
